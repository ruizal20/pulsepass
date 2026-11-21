import { z } from 'zod'
import { ArtistaSchema } from '../artistas/tipos'
import { SedeSchema } from '../sedes/tipos'

export const EventCategorySchema = z.enum([
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
])
export const EventStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'FINISHED'])
export type EventCategory = z.infer<typeof EventCategorySchema>
export type EventStatus = z.infer<typeof EventStatusSchema>

/** EventResponseDto del backend (nota: el nombre llega como `title`). */
export const EventoSchema = z.object({
  id: z.number(),
  eventCode: z.string(),
  title: z.string(),
  description: z.string().nullish(),
  category: EventCategorySchema,
  status: EventStatusSchema,
  eventDate: z.string(),
  minimumAge: z.number().nullish(),
  streamingUrl: z.string().nullish(),
  venue: SedeSchema.nullish(),
  artists: z
    .array(ArtistaSchema)
    .nullish()
    .transform((v) => v ?? []),
})
export type Evento = z.infer<typeof EventoSchema>
export const EventosSchema = z.array(EventoSchema)

/** CreateEventRequest (validaciones estructurales; la regla de fecha futura la aplica el backend). */
export const CrearEventoSchema = z.object({
  eventCode: z
    .string()
    .trim()
    .min(1, 'El código es obligatorio')
    .max(30, 'Máximo 30 caracteres'),
  name: z.string().trim().min(1, 'El nombre es obligatorio').max(150, 'Máximo 150 caracteres'),
  description: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria')
    .max(2000, 'Máximo 2000 caracteres'),
  category: EventCategorySchema,
  eventDate: z.string().min(1, 'La fecha y hora son obligatorias'),
  minimumAge: z
    .number({ error: 'Ingresa la edad mínima' })
    .int('Debe ser un número entero')
    .min(0, 'No puede ser negativa'),
  venueCode: z.string().min(1, 'Selecciona una sede'),
})
export type CrearEventoForm = z.infer<typeof CrearEventoSchema>
export const CAMPOS_CREAR_EVENTO = [
  'eventCode',
  'name',
  'description',
  'category',
  'eventDate',
  'minimumAge',
  'venueCode',
] as const
export const DESCRIPCION_MAX = 2000
