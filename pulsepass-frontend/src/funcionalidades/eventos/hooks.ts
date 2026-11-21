import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  asociarArtista,
  crearEvento,
  obtenerEvento,
  obtenerEventosPorArtista,
  obtenerEventosPublicados,
  publicarEvento,
} from './api'

export const useEventosPublicados = () =>
  useQuery({
    queryKey: ['eventos', 'publicados'],
    queryFn: obtenerEventosPublicados,
    staleTime: 60_000,
  })

export const useEvento = (eventCode: string | undefined) =>
  useQuery({
    queryKey: ['evento', eventCode],
    queryFn: () => obtenerEvento(eventCode ?? ''),
    enabled: Boolean(eventCode),
    staleTime: 30_000,
  })

export const useEventosPorArtista = (stageName: string | undefined) =>
  useQuery({
    queryKey: ['eventos', 'artista', stageName],
    queryFn: () => obtenerEventosPorArtista(stageName ?? ''),
    enabled: Boolean(stageName),
    staleTime: 60_000,
  })

export function useCrearEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: crearEvento,
    // Siembra la caché con el resultado
    onSuccess: (evento) => qc.setQueryData(['evento', evento.eventCode], evento),
  })
}

export function usePublicarEvento() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: publicarEvento,
    onSuccess: (evento) => {
      qc.setQueryData(['evento', evento.eventCode], evento)
      void qc.invalidateQueries({ queryKey: ['evento', evento.eventCode] })
      void qc.invalidateQueries({ queryKey: ['eventos', 'publicados'] })
    },
  })
}

export function useAsociarArtista() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ eventCode, artistId }: { eventCode: string; artistId: number }) =>
      asociarArtista(eventCode, artistId),
    onSuccess: (evento) => {
      qc.setQueryData(['evento', evento.eventCode], evento)
      void qc.invalidateQueries({ queryKey: ['evento', evento.eventCode] })
      void qc.invalidateQueries({ queryKey: ['eventos', 'artista'] })
    },
  })
}
