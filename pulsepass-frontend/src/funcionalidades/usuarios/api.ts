import { qs, request } from '../../lib/http'
import { UsuarioSchema, type RegistroForm } from './tipos'

export const registrarUsuario = (datos: RegistroForm) =>
  request('/users', { method: 'POST', body: datos, schema: UsuarioSchema })

export const obtenerUsuarioPorEmail = (email: string) =>
  request(`/users/by-email${qs({ email })}`, { schema: UsuarioSchema })

export const obtenerUsuarioPorUsername = (username: string) =>
  request(`/users/by-username${qs({ username })}`, { schema: UsuarioSchema })
