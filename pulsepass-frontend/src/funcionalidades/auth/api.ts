import { request } from '../../lib/http'
import { AuthResponseSchema, UsuarioAutenticadoSchema, type LoginForm } from './tipos'

export const iniciarSesionApi = (datos: LoginForm) =>
  request('/auth/login', {
    method: 'POST',
    body: datos,
    schema: AuthResponseSchema,
    ignorar401: true, // 401 aquí = credenciales inválidas, no sesión expirada
  })

export const obtenerMe = () => request('/auth/me', { schema: UsuarioAutenticadoSchema })
