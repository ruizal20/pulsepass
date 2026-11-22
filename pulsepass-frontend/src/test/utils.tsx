import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AvisosProvider } from '../componentes/Avisos'
import { AuthProvider } from '../funcionalidades/auth/AuthContext'
import { routes } from './rutasPrueba'
import { server } from './setup'

type RolPrueba = 'USER' | 'STAFF' | 'ADMIN'

interface Opciones {
  ruta?: string
  /** Simula una sesión ya iniciada (token válido en sessionStorage). */
  rol?: RolPrueba
  /** `state` de navegación inicial (p. ej. { desde: '/eventos' }). */
  state?: unknown
  /** Token ya vencido (restauración de sesión). */
  tokenVencido?: boolean
}

/** renderConProveedores del PRD §17: Router + Query + Auth + Avisos, con la app real. */
export function renderApp({ ruta = '/', rol, state, tokenVencido }: Opciones = {}) {
  if (rol) {
    sessionStorage.setItem(
      'pulsepass.sesion',
      JSON.stringify({
        token: `tok-${rol}`,
        expiraEn: Date.now() + (tokenVencido ? -1000 : 900_000),
      }),
    )
  }
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const { pathname, search } = new URL(ruta, 'http://localhost')
  const router = createMemoryRouter(routes, { initialEntries: [{ pathname, search, state }] })
  const user = userEvent.setup()
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AvisosProvider>
          <RouterProvider router={router} />
        </AvisosProvider>
      </AuthProvider>
    </QueryClientProvider>,
  )
  return { router, user, queryClient }
}

/** Registra cada petición que llega a la red simulada (para verificar "0 peticiones"). */
export function espiarPeticiones() {
  const peticiones: { metodo: string; url: string; cuerpo?: unknown; auth: string | null }[] = []
  server.events.on('request:start', ({ request }) => {
    peticiones.push({
      metodo: request.method,
      url: new URL(request.url).pathname,
      auth: request.headers.get('Authorization'),
    })
  })
  return peticiones
}
