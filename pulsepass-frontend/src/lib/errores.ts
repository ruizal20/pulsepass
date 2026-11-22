import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ApiError } from './http'

/** Mapeo HTTP → texto de interfaz (PRD §13). Siempre se renderiza como texto. */
export function mensajeDeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return 'No pudimos conectar con el servidor.'
    if (error.status >= 500) return 'Ocurrió un error inesperado. Inténtalo más tarde.'
    if (error.status === 401) return 'Tu sesión expiró. Inicia sesión de nuevo.'
    if (error.status === 403) return 'No tienes permisos para realizar esta acción.'
    return error.message
  }
  return 'Ocurrió un error inesperado. Inténtalo más tarde.'
}

export function esApiError(error: unknown, ...status: number[]): boolean {
  return error instanceof ApiError && status.includes(error.status)
}

/**
 * 400 con details → cada clave se asigna al campo homónimo (setError).
 * Devuelve un mensaje general si algo no pudo asignarse a un campo.
 */
export function aplicarErroresServidor<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  campos: readonly string[],
): string | null {
  if (!(error instanceof ApiError) || error.status !== 400) return mensajeDeError(error)
  const entradas = Object.entries(error.details)
  if (entradas.length === 0) return error.message
  const generales: string[] = []
  for (const [clave, mensaje] of entradas) {
    if (campos.includes(clave)) setError(clave as Path<T>, { type: 'server', message: mensaje })
    else generales.push(mensaje)
  }
  return generales.length > 0 ? generales.join(' · ') : null
}
