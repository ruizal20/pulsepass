import { z } from 'zod'

/** FE-002: el `location.state` también es un dato externo y se valida. */
const EstadoNavegacionSchema = z.object({
  desde: z
    .string()
    .startsWith('/')
    .refine((v) => !v.startsWith('//'), 'ruta externa')
    .optional(),
  motivo: z.literal('expirada').optional(),
  registrado: z.boolean().optional(),
  creado: z.boolean().optional(),
})

export type EstadoNavegacion = z.infer<typeof EstadoNavegacionSchema>

export function leerEstadoNavegacion(state: unknown): EstadoNavegacion {
  const r = EstadoNavegacionSchema.safeParse(state)
  return r.success ? r.data : {}
}
