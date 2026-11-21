import { z } from 'zod'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

/** Error uniforme de la app (NFR-FE006): toda respuesta no exitosa termina aquí. */
export class ApiError extends Error {
  status: number
  details: Record<string, string>

  constructor(status: number, message: string, details: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

const ErrorResponseSchema = z.object({
  status: z.number(),
  message: z.string(),
  details: z.record(z.string(), z.string()).nullish(),
})

// --- Token en memoria + manejador de 401 (los registra AuthContext) ----------
let tokenActual: string | null = null
let manejador401: (() => void) | null = null

export function fijarToken(token: string | null): void {
  tokenActual = token
}
export function registrarManejador401(fn: (() => void) | null): void {
  manejador401 = fn
}

interface Opciones<T> {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
  schema: z.ZodType<T>
  /** El login responde 401 por credenciales inválidas: no debe cerrar sesión. */
  ignorar401?: boolean
}

export async function request<T>(path: string, opciones: Opciones<T>): Promise<T> {
  const { method = 'GET', body, schema, ignorar401 = false } = opciones
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  // FE-013: el token viaja SOLO en el encabezado Authorization.
  const enviaToken = tokenActual !== null
  if (tokenActual) headers.Authorization = `Bearer ${tokenActual}`

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'No pudimos conectar con el servidor.')
  }

  if (!response.ok) {
    const cuerpo: unknown = await response.json().catch(() => null)
    const parsed = ErrorResponseSchema.safeParse(cuerpo)
    if (response.status === 401 && enviaToken && !ignorar401) manejador401?.()
    if (parsed.success) {
      throw new ApiError(response.status, parsed.data.message, parsed.data.details ?? {})
    }
    throw new ApiError(response.status, 'Ocurrió un error inesperado. Inténtalo más tarde.')
  }

  const json: unknown = response.status === 204 ? null : await response.json().catch(() => null)
  const resultado = schema.safeParse(json)
  if (!resultado.success) {
    throw new ApiError(500, 'La respuesta del servidor no tiene el formato esperado.')
  }
  return resultado.data
}

/** Construye un query string con encoding correcto (evita inyección en la URL). */
export function qs(params: Record<string, string>): string {
  return '?' + new URLSearchParams(params).toString()
}
