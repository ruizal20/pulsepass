import { useQuery } from '@tanstack/react-query'
import { obtenerSede, obtenerSedesActivas } from './api'

export const useSedesActivas = () =>
  useQuery({
    queryKey: ['sedes', 'activas'],
    queryFn: obtenerSedesActivas,
    staleTime: 5 * 60_000,
  })

export const useSede = (code: string | undefined) =>
  useQuery({
    queryKey: ['sede', code],
    queryFn: () => obtenerSede(code ?? ''),
    enabled: Boolean(code),
    staleTime: 5 * 60_000,
  })
