import { http, HttpResponse } from 'msw'
import {
  artistas,
  eventoAgotado,
  eventoBorrador,
  eventoCMF,
  eventoCultura,
  sede,
  ticketCancelado,
  ticketUsado,
  ticketVIP,
  usuarioAndrea,
  usuariosPorToken,
} from './datos'

export const API = '/api'

/** ErrorResponse con la misma forma que el GlobalExceptionHandler del backend. */
export const errorApi = (status: number, message: string, details: Record<string, string> = {}) =>
  HttpResponse.json(
    { timestamp: '2026-11-17T10:00:00', status, error: 'Error', message, details },
    { status },
  )

const eventos: (typeof eventoCMF)[] = [eventoCMF, eventoAgotado, eventoCultura, eventoBorrador]
const buscarEvento = (code: string | readonly string[] | undefined) =>
  eventos.find((e) => e.eventCode === code)

export const handlers = [
  // --- catálogo público ---
  http.get(`${API}/events/published`, () =>
    HttpResponse.json([eventoCMF, eventoAgotado, eventoCultura]),
  ),
  http.get(`${API}/events/by-artist`, ({ request }) => {
    const nombre = new URL(request.url).searchParams.get('stageName')
    return HttpResponse.json(eventos.filter((e) => e.artists.some((a) => a.stageName === nombre)))
  }),
  http.get(`${API}/events/:code/tickets/paid`, ({ params }) =>
    buscarEvento(params.code)
      ? HttpResponse.json([ticketVIP])
      : errorApi(404, `Evento no encontrado: ${String(params.code)}`),
  ),
  http.get(`${API}/events/:code`, ({ params }) => {
    const e = buscarEvento(params.code)
    return e ? HttpResponse.json(e) : errorApi(404, `Evento no encontrado: ${String(params.code)}`)
  }),
  http.get(`${API}/artists/active`, () => HttpResponse.json(artistas)),
  http.get(`${API}/artists/:id`, ({ params }) => {
    const a = artistas.find((x) => String(x.id) === params.id)
    return a ? HttpResponse.json(a) : errorApi(404, 'Artista no encontrado')
  }),
  http.get(`${API}/venues/active`, () => HttpResponse.json([sede])),
  http.get(`${API}/venues/:code`, ({ params }) =>
    params.code === sede.code ? HttpResponse.json(sede) : errorApi(404, 'Venue no encontrado'),
  ),

  // --- auth ---
  http.post(`${API}/auth/login`, async ({ request }) => {
    const b = (await request.json()) as { identifier: string; password: string }
    const mapa: Record<string, string> = { andrea: 'tok-USER', laura: 'tok-STAFF', admin: 'tok-ADMIN' }
    const token = mapa[b.identifier]
    if (!token || b.password !== 'Password-12345') return errorApi(401, 'Bad credentials')
    return HttpResponse.json({ accessToken: token, tokenType: 'Bearer', expiresIn: 900 })
  }),
  http.get(`${API}/auth/me`, ({ request }) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    const u = usuariosPorToken[token]
    return u ? HttpResponse.json(u) : errorApi(401, 'Unauthorized')
  }),
  http.post(`${API}/users`, async ({ request }) => {
    const b = (await request.json()) as { email: string }
    if (b.email === 'dup@pulsepass.test')
      return errorApi(409, 'El correo electrónico ya está registrado: dup@pulsepass.test')
    return HttpResponse.json(usuarioAndrea, { status: 201 })
  }),
  http.get(`${API}/users/by-email`, () => HttpResponse.json(usuarioAndrea)),
  http.get(`${API}/users/by-username`, () => HttpResponse.json(usuarioAndrea)),

  // --- tickets ---
  http.post(`${API}/tickets`, async ({ request }) => {
    const b = (await request.json()) as { type: string }
    return HttpResponse.json({ ...ticketVIP, type: b.type }, { status: 201 })
  }),
  http.get(`${API}/tickets/by-user`, () =>
    HttpResponse.json([ticketVIP, ticketUsado, ticketCancelado]),
  ),
  http.get(`${API}/tickets/:code`, ({ params }) => {
    const t = [ticketVIP, ticketUsado, ticketCancelado].find((x) => x.ticketCode === params.code)
    return t ? HttpResponse.json(t) : errorApi(404, `Ticket no encontrado con código: ${String(params.code)}`)
  }),
  http.patch(`${API}/tickets/:code/cancel`, () =>
    HttpResponse.json({ ...ticketVIP, status: 'CANCELLED' }),
  ),
  http.patch(`${API}/tickets/:code/use`, () => HttpResponse.json({ ...ticketVIP, status: 'USED' })),

  // --- admin ---
  http.post(`${API}/events`, async ({ request }) => {
    const b = (await request.json()) as { eventCode: string; name: string }
    return HttpResponse.json(
      { ...eventoBorrador, eventCode: b.eventCode, title: b.name },
      { status: 201 },
    )
  }),
  http.patch(`${API}/events/:code/publish`, ({ params }) =>
    HttpResponse.json({ ...eventoBorrador, eventCode: params.code, status: 'PUBLISHED' }),
  ),
  http.post(`${API}/events/:code/artists/:id`, ({ params }) =>
    HttpResponse.json({
      ...eventoBorrador,
      eventCode: params.code,
      artists: artistas.filter((a) => String(a.id) === params.id),
    }),
  ),
]
