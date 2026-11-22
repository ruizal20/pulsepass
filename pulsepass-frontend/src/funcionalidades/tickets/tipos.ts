import { z } from 'zod'
import { EventoSchema } from '../eventos/tipos'

export const TicketTypeSchema = z.enum(['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'])
export const TicketStatusSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])
export type TicketType = z.infer<typeof TicketTypeSchema>
export type TicketStatus = z.infer<typeof TicketStatusSchema>
export const TIPOS_TICKET = TicketTypeSchema.options

/** TicketResponseDto del backend (no incluye datos del titular). */
export const TicketSchema = z.object({
  id: z.number(),
  ticketCode: z.string(),
  type: TicketTypeSchema,
  price: z.number(),
  status: TicketStatusSchema,
  purchaseDate: z.string(),
  event: EventoSchema,
})
export type Ticket = z.infer<typeof TicketSchema>
export const TicketsSchema = z.array(TicketSchema)

export const CodigoTicketSchema = z.string().trim().min(1, 'Ingresa el código del ticket')
