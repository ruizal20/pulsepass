import { useQuery } from '@tanstack/react-query'
import { obtenerArtista, obtenerArtistaPorNombre, obtenerArtistasActivos } from './api'

export const useArtistasActivos = () =>
  useQuery({
    queryKey: ['artistas', 'activos'],
    queryFn: obtenerArtistasActivos,
    staleTime: 5 * 60_000,
  })

/** `id` ya viene validado (número finito) o undefined → no se llama a la API. */
export const useArtista = (id: number | undefined) =>
  useQuery({
    queryKey: ['artista', id],
    queryFn: () => obtenerArtista(id as number),
    enabled: id !== undefined,
    staleTime: 5 * 60_000,
  })

export const useArtistaPorNombre = (stageName: string | undefined) =>
  useQuery({
    queryKey: ['artista', 'nombre', stageName],
    queryFn: () => obtenerArtistaPorNombre(stageName ?? ''),
    enabled: Boolean(stageName),
    staleTime: 5 * 60_000,
  })
