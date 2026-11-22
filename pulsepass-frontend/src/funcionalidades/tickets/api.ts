import { qs, request } from '../../lib/http'
import { TicketSchema, TicketsSchema, type TicketType } from './tipos'

export const comprarTicketApi = (datos: { userEmail: string; eventCode: string; type: TicketType }) =>
  request('/tickets', { method: 'POST', body: datos, schema: TicketSchema })

export const obtenerTicket = (ticketCode: string) =>
  request(`/tickets/${encodeURIComponent(ticketCode)}`, { schema: TicketSchema })

export const obtenerTicketsDeUsuario = (email: string) =>
  request(`/tickets/by-user${qs({ email })}`, { schema: TicketsSchema })

export const obtenerTicketsPagadosPorEvento = (eventCode: string) =>
  request(`/events/${encodeURIComponent(eventCode)}/tickets/paid`, { schema: TicketsSchema })

export const cancelarTicketApi = (ticketCode: string) =>
  request(`/tickets/${encodeURIComponent(ticketCode)}/cancel`, {
    method: 'PATCH',
    schema: TicketSchema,
  })

export const usarTicketApi = (ticketCode: string) =>
  request(`/tickets/${encodeURIComponent(ticketCode)}/use`, {
    method: 'PATCH',
    schema: TicketSchema,
  })
