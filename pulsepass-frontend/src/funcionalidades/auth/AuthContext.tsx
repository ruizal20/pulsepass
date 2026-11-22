import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { fijarToken, registrarManejador401 } from '../../lib/http'
import { iniciarSesionApi, obtenerMe } from './api'
import { borrarSesionGuardada, guardarSesion, leerSesionGuardada } from './almacenamiento'
import type { Rol, Sesion } from './tipos'

export interface AuthContextValor {
  sesion: Sesion
  iniciarSesion: (identifier: string, password: string) => Promise<void>
  cerrarSesion: (motivo?: 'expirada') => void
  tieneRol: (...roles: Rol[]) => boolean
}

export const AuthContext = createContext<AuthContextValor | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [sesion, setSesion] = useState<Sesion>(() =>
    leerSesionGuardada() ? { estado: 'cargando' } : { estado: 'anonimo' },
  )

  const cerrarSesion = useCallback(
    (motivo?: 'expirada') => {
      fijarToken(null)
      borrarSesionGuardada()
      queryClient.clear() // no dejar datos de la persona anterior en caché
      setSesion({ estado: 'anonimo', expirada: motivo === 'expirada' })
    },
    [queryClient],
  )

  // Restaurar sesión al recargar (FR-FE-AUTH-004): se revalida el token con /auth/me.
  useEffect(() => {
    const guardada = leerSesionGuardada()
    if (!guardada) return
    let cancelado = false
    fijarToken(guardada.token)
    obtenerMe()
      .then((usuario) => {
        if (!cancelado)
          setSesion({
            estado: 'autenticado',
            token: guardada.token,
            expiraEn: guardada.expiraEn,
            usuario,
          })
      })
      .catch(() => {
        if (cancelado) return
        fijarToken(null)
        borrarSesionGuardada()
        setSesion({ estado: 'anonimo' })
      })
    return () => {
      cancelado = true
    }
  }, [])

  // Cualquier 401 posterior cierra la sesión local (FR-FE-AUTH-005).
  useEffect(() => {
    registrarManejador401(() => cerrarSesion('expirada'))
    return () => registrarManejador401(null)
  }, [cerrarSesion])

  // Cierre programado al vencer el token.
  const expiraEn = sesion.estado === 'autenticado' ? sesion.expiraEn : null
  useEffect(() => {
    if (expiraEn === null) return
    const espera = Math.min(Math.max(expiraEn - Date.now(), 0), 2_000_000_000)
    const id = setTimeout(() => cerrarSesion('expirada'), espera)
    return () => clearTimeout(id)
  }, [expiraEn, cerrarSesion])

  const iniciarSesion = useCallback(async (identifier: string, password: string) => {
    const auth = await iniciarSesionApi({ identifier, password })
    const expira = Date.now() + auth.expiresIn * 1000
    fijarToken(auth.accessToken)
    try {
      const usuario = await obtenerMe()
      guardarSesion({ token: auth.accessToken, expiraEn: expira })
      setSesion({ estado: 'autenticado', token: auth.accessToken, expiraEn: expira, usuario })
    } catch (error) {
      fijarToken(null)
      throw error
    }
  }, [])

  const tieneRol = useCallback(
    (...roles: Rol[]) =>
      sesion.estado === 'autenticado' && roles.some((r) => sesion.usuario.roles.includes(r)),
    [sesion],
  )

  const valor = useMemo(
    () => ({ sesion, iniciarSesion, cerrarSesion, tieneRol }),
    [sesion, iniciarSesion, cerrarSesion, tieneRol],
  )
  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
