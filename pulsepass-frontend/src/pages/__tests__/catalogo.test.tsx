import { screen, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API, errorApi } from '../../test/mocks/handlers'
import { server } from '../../test/setup'
import { espiarPeticiones, renderApp } from '../../test/utils'

describe('Catálogo de eventos', () => {
  it('TEST-FE-EVT-001 / AC-FE-001: anónimo ve los eventos publicados sin login', async () => {
    renderApp({ ruta: '/eventos' })
    expect(await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Noche de Jazz y Cultura' })).toBeInTheDocument()
    expect(screen.getByText('3 eventos')).toBeInTheDocument()
    expect(screen.queryByText('Evento en borrador')).not.toBeInTheDocument()
  })

  it('TEST-FE-EVT-002: lista vacía → estado vacío', async () => {
    server.use(http.get(`${API}/events/published`, () => HttpResponse.json([])))
    renderApp({ ruta: '/eventos' })
    expect(await screen.findByText('Sin resultados para tu búsqueda')).toBeInTheDocument()
  })

  it('error de red → mensaje y botón Reintentar', async () => {
    server.use(http.get(`${API}/events/published`, () => HttpResponse.error()))
    renderApp({ ruta: '/eventos' })
    expect(await screen.findByText('No pudimos conectar con el servidor.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('TEST-FE-EVT-003: el filtro por texto y categoría actualiza la URL', async () => {
    const { router, user } = renderApp({ ruta: '/eventos' })
    await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })
    await user.type(screen.getByRole('searchbox', { name: 'Buscar por nombre' }), 'jazz')
    expect(router.state.location.search).toBe('?q=jazz')
    expect(screen.getByText('1 evento')).toBeInTheDocument()
    await user.clear(screen.getByRole('searchbox', { name: 'Buscar por nombre' }))
    await user.selectOptions(screen.getByLabelText('Categoría'), 'MUSIC')
    expect(router.state.location.search).toBe('?categoria=MUSIC')
    expect(screen.getByRole('heading', { name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Noche de Jazz y Cultura' })).not.toBeInTheDocument()
  })

  it('el filtro sobrevive a recargar (se lee de la URL)', async () => {
    renderApp({ ruta: '/eventos?q=jazz' })
    expect(await screen.findByRole('heading', { name: 'Noche de Jazz y Cultura' })).toBeInTheDocument()
    expect(screen.getByRole('searchbox', { name: 'Buscar por nombre' })).toHaveValue('jazz')
  })

  it('?artista= usa GET /events/by-artist', async () => {
    const peticiones = espiarPeticiones()
    renderApp({ ruta: '/eventos?artista=Neon%20Waves' })
    expect(await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
    expect(peticiones.some((p) => p.url === '/api/events/by-artist')).toBe(true)
  })
})

describe('Detalle de evento', () => {
  it('TEST-FE-EVT-004 / AC-FE-002: muestra evento, artistas y sede', async () => {
    renderApp({ ruta: '/eventos/CMF-2026' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
    expect(screen.getByText('Edad mínima: 18')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Solar Beat/ })).toBeInTheDocument()
    expect(screen.getByText('Marina Convention Center')).toBeInTheDocument()
    expect(screen.getByText(/Santa Marta · Capacidad 3/)).toBeInTheDocument()
  })

  it('TEST-FE-EVT-005 / AC-FE-003: 404 → "Evento no disponible"', async () => {
    renderApp({ ruta: '/eventos/NO-EXISTE' })
    expect(await screen.findByText('Evento no disponible')).toBeInTheDocument()
  })

  it('403 de un borrador también se presenta como "Evento no disponible" (GAP-02)', async () => {
    server.use(http.get(`${API}/events/:code`, () => errorApi(403, 'Forbidden')))
    renderApp({ ruta: '/eventos/DRF-2027' })
    expect(await screen.findByText('Evento no disponible')).toBeInTheDocument()
  })

  it('TEST-FE-EVT-006: evento SOLD_OUT → compra deshabilitada con motivo', async () => {
    renderApp({ ruta: '/eventos/TCC-2027', rol: 'USER' })
    expect(await screen.findByText('Entradas agotadas.')).toBeInTheDocument()
    const botones = screen.getAllByRole('button', { name: 'Comprar entrada' })
    botones.forEach((b) => expect(b).toBeDisabled())
  })
})

describe('Artistas y sedes', () => {
  it('TEST-FE-ART-001: lista de artistas activos', async () => {
    renderApp({ ruta: '/artistas' })
    const lista = await screen.findByRole('list')
    expect(within(lista).getByText('Solar Beat')).toBeInTheDocument()
    expect(within(lista).getByText('Fusión caribeña')).toBeInTheDocument()
  })

  it('TEST-FE-ART-002: detalle de artista con sus eventos', async () => {
    renderApp({ ruta: '/artistas/1' })
    expect(await screen.findByRole('heading', { level: 1, name: 'Solar Beat' })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
  })

  it('TEST-FE-ART-003: id no numérico → 404 sin llamar a la API', async () => {
    const peticiones = espiarPeticiones()
    renderApp({ ruta: '/artistas/abc' })
    expect(await screen.findByText('No encontramos a este artista')).toBeInTheDocument()
    expect(peticiones.filter((p) => p.url.startsWith('/api/artists'))).toHaveLength(0)
  })

  it('TEST-FE-VEN-001: lista y detalle de sede; 404 de sede', async () => {
    const r1 = renderApp({ ruta: '/sedes' })
    expect(await screen.findByText('Marina Convention Center')).toBeInTheDocument()
    expect(screen.getByText(/Santa Marta · Cap\. 3/)).toBeInTheDocument()
    r1.router.dispose()
  })

  it('detalle de sede', async () => {
    renderApp({ ruta: '/sedes/VEN-SMR-01' })
    expect(await screen.findByRole('heading', { name: 'Marina Convention Center' })).toBeInTheDocument()
    expect(screen.getByText('3 personas')).toBeInTheDocument()
  })

  it('sede inexistente → página no encontrada', async () => {
    renderApp({ ruta: '/sedes/XXX' })
    expect(await screen.findByText('No encontramos esta sede')).toBeInTheDocument()
  })
})
