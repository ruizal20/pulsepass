/** Todas las rutas de la app (FE-003): nunca se escriben strings sueltos. */
export const RUTAS = {
  inicio: '/',
  eventos: '/eventos',
  evento: (eventCode: string) => `/eventos/${encodeURIComponent(eventCode)}`,
  artistas: '/artistas',
  artista: (id: number | string) => `/artistas/${id}`,
  sedes: '/sedes',
  sede: (code: string) => `/sedes/${encodeURIComponent(code)}`,
  login: '/login',
  registro: '/registro',
  cuenta: '/cuenta',
  misTickets: '/mis-tickets',
  ticket: (ticketCode: string) => `/mis-tickets/${encodeURIComponent(ticketCode)}`,
  confirmacion: (ticketCode: string) => `/compra/confirmacion/${encodeURIComponent(ticketCode)}`,
  validacion: '/staff/validacion',
  ticketsPagados: (eventCode?: string) =>
    eventCode
      ? `/staff/eventos/${encodeURIComponent(eventCode)}/tickets`
      : '/staff/eventos/tickets',
  adminEventos: '/admin/eventos',
  adminNuevo: '/admin/eventos/nuevo',
  adminEvento: (eventCode: string) => `/admin/eventos/${encodeURIComponent(eventCode)}`,
  sinPermisos: '/403',
} as const
