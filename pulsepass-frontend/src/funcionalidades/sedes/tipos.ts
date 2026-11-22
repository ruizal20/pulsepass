import { z } from 'zod'

/** VenueResponseDto del backend */
export const SedeSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  city: z.string(),
  address: z.string().nullish(),
  capacity: z.number(),
  active: z.boolean(),
})
export type Sede = z.infer<typeof SedeSchema>
export const SedesSchema = z.array(SedeSchema)
