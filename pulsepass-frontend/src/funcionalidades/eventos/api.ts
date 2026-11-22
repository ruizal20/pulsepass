import { qs, request } from '../../lib/http'
import { EventoSchema, EventosSchema, type CrearEventoForm } from './tipos'

export const obtenerEvento = (eventCode: string) =>
  request(`/events/${encodeURIComponent(eventCode)}`, { schema: EventoSchema })

export const obtenerEventosPublicados = () =>
  request('/events/published', { schema: EventosSchema })

export const obtenerEventosPorArtista = (stageName: string) =>
  request(`/events/by-artist${qs({ stageName })}`, { schema: EventosSchema })

export const crearEvento = (datos: CrearEventoForm) =>
  request('/events', { method: 'POST', body: datos, schema: EventoSchema })

export const publicarEvento = (eventCode: string) =>
  request(`/events/${encodeURIComponent(eventCode)}/publish`, {
    method: 'PATCH',
    schema: EventoSchema,
  })

export const asociarArtista = (eventCode: string, artistId: number) =>
  request(`/events/${encodeURIComponent(eventCode)}/artists/${artistId}`, {
    method: 'POST',
    schema: EventoSchema,
  })
