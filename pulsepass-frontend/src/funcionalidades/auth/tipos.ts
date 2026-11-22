import { z } from 'zod'

export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])
export type Rol = z.infer<typeof RolSchema>

export const LoginSchema = z.object({
  identifier: z.string().trim().min(1, 'Ingresa tu usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
export type LoginForm = z.infer<typeof LoginSchema>

export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.string().optional(),
  expiresIn: z.number().positive(),
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>

/**
 * GET /api/auth/me. Supuesto (PRD R-FE-002): como mínimo username, email y roles.
 * Los roles se normalizan: "ROLE_ADMIN" → "ADMIN"; se descartan valores desconocidos.
 */
export const UsuarioAutenticadoSchema = z
  .object({
    username: z.string(),
    email: z.string(),
    roles: z.array(z.string()),
  })
  .loose()
  .transform((u) => ({
    username: u.username,
    email: u.email,
    roles: u.roles
      .map((r) => r.replace(/^ROLE_/, '').toUpperCase())
      .filter((r): r is Rol => RolSchema.safeParse(r).success),
  }))
export type UsuarioAutenticado = z.infer<typeof UsuarioAutenticadoSchema>

/** FE-006: la sesión es una unión discriminada, no varios booleanos. */
export type Sesion =
  | { estado: 'cargando' }
  | { estado: 'anonimo'; expirada?: boolean }
  | { estado: 'autenticado'; token: string; expiraEn: number; usuario: UsuarioAutenticado }

/** Lo único que se guarda en sessionStorage (FE-002: se valida al leer). */
export const SesionGuardadaSchema = z.object({ token: z.string().min(1), expiraEn: z.number() })
export type SesionGuardada = z.infer<typeof SesionGuardadaSchema>
