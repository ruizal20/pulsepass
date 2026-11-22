import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { server } from '../../test/setup'
import { API, errorApi } from '../../test/mocks/handlers'
import { ApiError, fijarToken, registrarManejador401, request } from '../http'
import { formatearCOP, formatearFecha, formatearFechaNacimiento } from '../formato'
import { esApiError, mensajeDeError } from '../errores'

const schema = z.object({ ok: z.boolean() })

describe('http', () => {
  it('TEST-FE-LIB-001: añade Authorization Bearer cuando hay sesión (y solo ahí)', async () => {
    let auth: string | null = 'sin-leer'
    let url = ''
    server.use(
      http.get(`${API}/x`, ({ request: r }) => {
        auth = r.headers.get('Authorization')
        url = r.url
        return HttpResponse.json({ ok: true })
      }),
    )
    fijarToken('abc123')
    await request('/x', { schema })
    expect(auth).toBe('Bearer abc123')
    expect(url).not.toContain('abc123') // FE-013: nunca en la URL
    fijarToken(null)
    await request('/x', { schema })
    expect(auth).toBeNull()
  })

  it('TEST-FE-LIB-002: ErrorResponse válido → ApiError con status y details', async () => {
    server.use(http.get(`${API}/x`, () => errorApi(400, 'Validation failed', { email: 'inválido' })))
    const error = await request('/x', { schema }).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 400, message: 'Validation failed', details: { email: 'inválido' } })
  })

  it('TEST-FE-LIB-003: cuerpo de error inválido → ApiError genérico', async () => {
    server.use(http.get(`${API}/x`, () => HttpResponse.text('<html>boom</html>', { status: 500 })))
    const error = await request('/x', { schema }).catch((e: unknown) => e)
    expect(error).toMatchObject({ status: 500, message: 'Ocurrió un error inesperado. Inténtalo más tarde.' })
  })

  it('TEST-FE-LIB-004: 401 con sesión dispara el cierre de sesión', async () => {
    const cerrar = vi.fn()
    registrarManejador401(cerrar)
    server.use(http.get(`${API}/x`, () => errorApi(401, 'Unauthorized')))
    fijarToken('vencido')
    await request('/x', { schema }).catch(() => undefined)
    expect(cerrar).toHaveBeenCalledTimes(1)
    // sin token (login con credenciales malas) no cierra sesión
    fijarToken(null)
    await request('/x', { schema }).catch(() => undefined)
    expect(cerrar).toHaveBeenCalledTimes(1)
  })

  it('respuesta con forma inesperada → ApiError 500 (validación zod)', async () => {
    server.use(http.get(`${API}/x`, () => HttpResponse.json({ otro: 1 })))
    await expect(request('/x', { schema })).rejects.toMatchObject({ status: 500 })
  })

  it('falla de red → ApiError(0) con mensaje de conexión', async () => {
    server.use(http.get(`${API}/x`, () => HttpResponse.error()))
    const error = await request('/x', { schema }).catch((e: unknown) => e)
    expect(error).toMatchObject({ status: 0 })
    expect(mensajeDeError(error)).toBe('No pudimos conectar con el servidor.')
  })
})

describe('mapeo de errores y formato', () => {
  it('QT-FE-005: 400/403/404/409/500 → mensajes de UI', () => {
    expect(mensajeDeError(new ApiError(409, 'Regla de negocio'))).toBe('Regla de negocio')
    expect(mensajeDeError(new ApiError(404, 'No existe'))).toBe('No existe')
    expect(mensajeDeError(new ApiError(403, 'x'))).toBe('No tienes permisos para realizar esta acción.')
    expect(mensajeDeError(new ApiError(500, 'NullPointerException en línea 3'))).toBe(
      'Ocurrió un error inesperado. Inténtalo más tarde.',
    )
    expect(esApiError(new ApiError(404, ''), 404, 403)).toBe(true)
  })

  it('TEST-FE-LIB-005: formatea COP, fechas es-CO y fecha de nacimiento sin desfase', () => {
    expect(formatearCOP(250000)).toBe('$ 250.000')
    expect(formatearFecha('2026-12-12T20:00:00')).toBe('12 dic 2026')
    expect(formatearFechaNacimiento('1998-04-12')).toBe('12/04/1998')
  })
})
