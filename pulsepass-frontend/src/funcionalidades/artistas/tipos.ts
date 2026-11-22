import { z } from 'zod'

/** ArtistResponseDto del backend */
export const ArtistaSchema = z.object({
  id: z.number(),
  stageName: z.string(),
  biography: z.string().nullish(),
  musicalGenre: z.string().nullish(),
})
export type Artista = z.infer<typeof ArtistaSchema>
export const ArtistasSchema = z.array(ArtistaSchema)
