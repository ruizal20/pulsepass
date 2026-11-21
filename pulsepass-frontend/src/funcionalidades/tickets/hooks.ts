import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEmailSesion } from '../auth/hooks'
import {
  cancelarTicketApi,
  comprarTicketApi,
  obtenerTicket,
  obtenerTicketsDeUsuario,
  obtenerTicketsPagadosPorEvento,
  usarTicketApi,
} from './api'
import type { TicketType } from './tipos'

export function useMisTickets() {
  const email = useEmailSesion()
  return useQuery({
    queryKey: ['tickets', 'usuario', email],
    queryFn: () => obtenerTicketsDeUsuario(email ?? ''),
    enabled: Boolean(email),
    staleTime: 15_000,
  })
}

export const useTicket = (ticketCode: string | undefined) =>
  useQuery({
    queryKey: ['ticket', ticketCode],
    queryFn: () => obtenerTicket(ticketCode ?? ''),
    enabled: Boolean(ticketCode),
    staleTime: 15_000,
  })

/** Consulta bajo demanda para la validación en puerta (STAFF). */
export const useBuscarTicket = useTicket

export const useTicketsPagadosPorEvento = (eventCode: string | undefined) =>
  useQuery({
    queryKey: ['tickets', 'pagados', eventCode],
    queryFn: () => obtenerTicketsPagadosPorEvento(eventCode ?? ''),
    enabled: Boolean(eventCode),
    staleTime: 15_000,
  })

export function useComprarTicket() {
  const qc = useQueryClient()
  const email = useEmailSesion()
  return useMutation({
    // El email SIEMPRE sale de la sesión; nunca de un campo editable (anti-IDOR).
    mutationFn: ({ eventCode, type }: { eventCode: string; type: TicketType }) => {
      if (!email) throw new Error('Se requiere una sesión activa')
      return comprarTicketApi({ userEmail: email, eventCode, type })
    },
    onSuccess: (ticket, { eventCode }) => {
      qc.setQueryData(['ticket', ticket.ticketCode], ticket)
      void qc.invalidateQueries({ queryKey: ['tickets', 'usuario', email] })
      void qc.invalidateQueries({ queryKey: ['evento', eventCode] })
    },
  })
}

export function useCancelarTicket() {
  const qc = useQueryClient()
  const email = useEmailSesion()
  return useMutation({
    mutationFn: cancelarTicketApi,
    onSuccess: (ticket) => {
      void qc.invalidateQueries({ queryKey: ['tickets', 'usuario', email] })
      void qc.invalidateQueries({ queryKey: ['ticket', ticket.ticketCode] })
      void qc.invalidateQueries({ queryKey: ['tickets', 'pagados', ticket.event.eventCode] })
    },
  })
}

export function useUsarTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: usarTicketApi,
    onSuccess: (ticket) => {
      void qc.invalidateQueries({ queryKey: ['ticket', ticket.ticketCode] })
      void qc.invalidateQueries({ queryKey: ['tickets', 'pagados', ticket.event.eventCode] })
    },
  })
}
