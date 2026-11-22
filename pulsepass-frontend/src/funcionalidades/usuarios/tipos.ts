import { z } from 'zod'

export const PerfilSchema = z.object({
  id: z.number().nullish(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullish(),
  city: z.string().nullish(),
  birthDate: z.string().nullish(),
})

/** UserResponseDto del backend (nunca incluye hash ni contraseña). */
export const UsuarioSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  active: z.boolean().nullish(),
  profile: PerfilSchema.nullish(),
})
export type Usuario = z.infer<typeof UsuarioSchema>

const hoy = () => new Date().toISOString().slice(0, 10)
const bytesUtf8 = (s: string) => new TextEncoder().encode(s).length

/** RegisterUserRequest + password (Fase 4). */
export const RegistroSchema = z.object({
  username: z.string().trim().min(3, 'Mínimo 3 caracteres').max(50, 'Máximo 50 caracteres'),
  email: z.email('Ingresa un correo válido'),
  firstName: z.string().trim().min(1, 'Los nombres son obligatorios'),
  lastName: z.string().trim().min(1, 'Los apellidos son obligatorios'),
  phone: z.string().trim().min(1, 'El teléfono es obligatorio'),
  city: z.string().trim().min(1, 'La ciudad es obligatoria'),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ingresa una fecha válida')
    .refine((v) => v <= hoy(), 'La fecha no puede ser futura'),
  password: z
    .string()
    .min(12, 'La contraseña debe tener al menos 12 caracteres')
    .refine((p) => bytesUtf8(p) <= 72, 'La contraseña no puede superar 72 bytes'),
})
export type RegistroForm = z.infer<typeof RegistroSchema>
export const CAMPOS_REGISTRO = [
  'username',
  'email',
  'firstName',
  'lastName',
  'phone',
  'city',
  'birthDate',
  'password',
] as const

/** Fortaleza orientativa de la contraseña (solo UX). */
export function fortalezaPassword(p: string): { nivel: 0 | 1 | 2 | 3; etiqueta: string } {
  if (p.length === 0) return { nivel: 0, etiqueta: '' }
  let puntos = 0
  if (p.length >= 12) puntos++
  if (p.length >= 16) puntos++
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) puntos++
  if (/\d/.test(p)) puntos++
  if (/[^A-Za-z0-9]/.test(p)) puntos++
  if (puntos <= 2) return { nivel: 1, etiqueta: 'baja' }
  if (puntos <= 3) return { nivel: 2, etiqueta: 'media' }
  return { nivel: 3, etiqueta: 'alta' }
}
