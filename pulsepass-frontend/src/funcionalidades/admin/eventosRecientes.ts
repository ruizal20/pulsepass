import { useSyncExternalStore } from 'react'
import { z } from 'zod'

/**
 * GAP-01: la API no lista todos los eventos. Los eventos creados en esta sesión
 * se recuerdan en sessionStorage (se pierde al cerrar la pestaña; limitación documentada).
 */
const CLAVE = 'pulsepass.admin.recientes'
const ListaSchema = z.array(z.string())
const oyentes = new Set<() => void>()

function leer(): readonly string[] {
  try {
    const r = ListaSchema.safeParse(JSON.parse(sessionStorage.getItem(CLAVE) ?? '[]'))
    return r.success ? r.data : []
  } catch {
    return []
  }
}

let instantanea: readonly string[] = leer()

export function recordarEventoCreado(eventCode: string): void {
  instantanea = [eventCode, ...instantanea.filter((c) => c !== eventCode)].slice(0, 20)
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(instantanea))
  } catch {
    /* solo en memoria */
  }
  oyentes.forEach((o) => o())
}

export function olvidarEventosCreados(): void {
  instantanea = []
  try {
    sessionStorage.removeItem(CLAVE)
  } catch {
    /* noop */
  }
  oyentes.forEach((o) => o())
}

export function useEventosCreados(): readonly string[] {
  return useSyncExternalStore(
    (cb) => {
      oyentes.add(cb)
      return () => oyentes.delete(cb)
    },
    () => instantanea,
  )
}
