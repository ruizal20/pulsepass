import { request } from '../../lib/http'
import { SedeSchema, SedesSchema } from './tipos'

export const obtenerSede = (code: string) =>
  request(`/venues/${encodeURIComponent(code)}`, { schema: SedeSchema })

export const obtenerSedesActivas = () => request('/venues/active', { schema: SedesSchema })
