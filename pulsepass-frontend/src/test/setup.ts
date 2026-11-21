import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { cleanup, configure } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { olvidarEventosCreados } from '../funcionalidades/admin/eventosRecientes'
import { fijarToken, registrarManejador401 } from '../lib/http'
import { handlers } from './mocks/handlers'

// Las rutas son perezosas (import dinámico): damos margen a findBy*/waitFor en máquinas lentas.
configure({ asyncUtilTimeout: 4000 })

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => {
  cleanup()
  server.resetHandlers()
  sessionStorage.clear()
  olvidarEventosCreados()
  fijarToken(null)
  registrarManejador401(null)
})
afterAll(() => server.close())
