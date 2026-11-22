import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './http'

/** PRD §14.3: sin reintentos para 4xx; 1 reintento para red/5xx; mutaciones nunca. */
export function crearQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: (intentos, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false
          return intentos < 1
        },
      },
      mutations: { retry: false },
    },
  })
}

export const queryClient = crearQueryClient()
