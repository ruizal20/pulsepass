import { useContext } from 'react'
import { AuthContext, type AuthContextValor } from './AuthContext'

export function useAuth(): AuthContextValor {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

/** Email de la persona autenticada (o undefined). Es la única fuente de identidad en compras. */
export function useEmailSesion(): string | undefined {
  const { sesion } = useAuth()
  return sesion.estado === 'autenticado' ? sesion.usuario.email : undefined
}
