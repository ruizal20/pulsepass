import { qs, request } from '../../lib/http'
import { ArtistaSchema, ArtistasSchema } from './tipos'

export const obtenerArtista = (id: number) => request(`/artists/${id}`, { schema: ArtistaSchema })

export const obtenerArtistaPorNombre = (stageName: string) =>
  request(`/artists/by-stage-name${qs({ stageName })}`, { schema: ArtistaSchema })

export const obtenerArtistasActivos = () => request('/artists/active', { schema: ArtistasSchema })
