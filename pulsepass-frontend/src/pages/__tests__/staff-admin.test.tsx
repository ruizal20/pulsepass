import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { artistas, eventoBorrador, ticketVIP } from '../../test/mocks/datos'
import { API, errorApi } from '../../test/mocks/handlers'
import { server } from '../../test/setup'
import { espiarPeticiones, renderApp } from '../../test/utils'

describe('STAFF — validación de ingreso', () => {
  it('TEST-FE-STF-001 / AC-FE-016: buscar y marcar como usado → éxito y campo limpio', async () => {
    let usado = false
    server.use(
      http.get(`${API}/tickets/:code`, () => HttpResponse.json({ ...ticketVIP, status: usado ? 'USED' : 'PAID' })),
      http.patch(`${API}/tickets/:code/use`, () => {
        usado = true
        return HttpResponse.json({ ...ticketVIP, status: 'USED' })
      }),
    )
    const { user } = renderApp({ ruta: '/staff/validacion', rol: 'STAFF' })
    const campo = await screen.findByLabelText('Código de ticket')
    expect(campo).toHaveFocus() // foco automático para uso en puerta
    await user.type(campo, 'TKT-8F2A1C{Enter}') // Enter busca
    await user.click(await screen.findByRole('button', { name: 'Marcar como usado' }))
    expect(await screen.findByText('Ingreso registrado.')).toBeInTheDocument()
    expect(screen.getByLabelText('Código de ticket')).toHaveValue('')
    await waitFor(() => expect(screen.getByText('USED')).toBeInTheDocument())
  })

  it('TEST-FE-STF-002 / AC-FE-016: segunda vez → 409 visible con el mensaje del backend', async () => {
    server.use(
      http.patch(`${API}/tickets/:code/use`, () => errorApi(409, 'El ticket ya fue utilizado.')),
    )
    const { user } = renderApp({ ruta: '/staff/validacion', rol: 'STAFF' })
    await user.type(await screen.findByLabelText('Código de ticket'), 'TKT-8F2A1C{Enter}')
    await user.click(await screen.findByRole('button', { name: 'Marcar como usado' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('El ticket ya fue utilizado.')
  })

  it('TEST-FE-STF-003: ticket inexistente → "Ticket no encontrado."', async () => {
    const { user } = renderApp({ ruta: '/staff/validacion', rol: 'STAFF' })
    await user.type(await screen.findByLabelText('Código de ticket'), 'NO-EXISTE{Enter}')
    expect(await screen.findByText('Ticket no encontrado.')).toBeInTheDocument()
  })

  it('código vacío → error de campo y 0 peticiones a tickets', async () => {
    const peticiones = espiarPeticiones()
    const { user } = renderApp({ ruta: '/staff/validacion', rol: 'STAFF' })
    await user.click(await screen.findByRole('button', { name: 'Buscar' }))
    expect(await screen.findByText('Ingresa el código del ticket')).toBeInTheDocument()
    expect(peticiones.filter((p) => p.url.startsWith('/api/tickets'))).toHaveLength(0)
  })

  it('un ticket ya USED no ofrece "Marcar como usado"', async () => {
    server.use(http.get(`${API}/tickets/:code`, () => HttpResponse.json({ ...ticketVIP, status: 'USED' })))
    const { user } = renderApp({ ruta: '/staff/validacion', rol: 'ADMIN' })
    await user.type(await screen.findByLabelText('Código de ticket'), 'TKT-8F2A1C{Enter}')
    expect(await screen.findByText('Este ticket ya figura como usado.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Marcar como usado' })).not.toBeInTheDocument()
  })
})

describe('STAFF — tickets pagados por evento', () => {
  it('TEST-FE-STF-004: tabla con filas y acción "Usar"', async () => {
    renderApp({ ruta: '/staff/eventos/CMF-2026/tickets', rol: 'STAFF' })
    const tabla = await screen.findByRole('table', { name: 'Tickets pagados' })
    expect(within(tabla).getByText('TKT-8F2A1C')).toBeInTheDocument()
    expect(within(tabla).getByText('$ 250.000')).toBeInTheDocument()
    expect(within(tabla).getByRole('button', { name: 'Usar' })).toBeInTheDocument()
    expect(screen.getByText('Total: 1')).toBeInTheDocument()
  })

  it('"Usar" marca el ticket e invalida la lista', async () => {
    let usado = false
    server.use(
      http.get(`${API}/events/:code/tickets/paid`, () => HttpResponse.json(usado ? [] : [ticketVIP])),
      http.patch(`${API}/tickets/:code/use`, () => {
        usado = true
        return HttpResponse.json({ ...ticketVIP, status: 'USED' })
      }),
    )
    const { user } = renderApp({ ruta: '/staff/eventos/CMF-2026/tickets', rol: 'STAFF' })
    const tabla = await screen.findByRole('table')
    await user.click(within(tabla).getByRole('button', { name: 'Usar' }))
    expect(await screen.findByText('Ingreso registrado: TKT-8F2A1C')).toBeInTheDocument()
    expect(await screen.findByText('No hay tickets pagados')).toBeInTheDocument()
  })

  it('en móvil la tabla se transforma en lista de tarjetas (ambas vistas en el DOM, CSS decide)', async () => {
    renderApp({ ruta: '/staff/eventos/CMF-2026/tickets', rol: 'STAFF' })
    await screen.findByRole('table')
    const tarjetas = screen.getByRole('list', { name: 'Tickets pagados' })
    expect(within(tarjetas).getByText('TKT-8F2A1C')).toBeInTheDocument()
  })

  it('evento inexistente → "Evento no encontrado"', async () => {
    renderApp({ ruta: '/staff/eventos/NO-EXISTE/tickets', rol: 'STAFF' })
    expect(await screen.findByText('Evento no encontrado')).toBeInTheDocument()
  })

  it('sin evento elegido (enlace de la navbar) → pide un código y "Ir" navega', async () => {
    const { user, router } = renderApp({ ruta: '/staff/eventos/tickets', rol: 'STAFF' })
    expect(await screen.findByText(/Ingresa el código de un evento/)).toBeInTheDocument()
    await user.type(screen.getByLabelText('Evento'), 'CMF-2026')
    await user.click(screen.getByRole('button', { name: 'Ir' }))
    await screen.findByRole('table')
    expect(router.state.location.pathname).toBe('/staff/eventos/CMF-2026/tickets')
  })
})

async function llenarEvento(user: ReturnType<typeof renderApp>['user']) {
  await user.type(await screen.findByLabelText('Código del evento'), 'NEW-2027')
  await user.type(screen.getByLabelText('Nombre'), 'Festival Nuevo')
  await user.type(screen.getByLabelText('Descripción'), 'Una descripción')
  await user.type(screen.getByLabelText('Fecha y hora'), '2027-12-12T20:00')
  await screen.findByRole('option', { name: /Marina Convention Center/ })
  await user.selectOptions(screen.getByLabelText('Sede'), 'VEN-SMR-01')
}

describe('ADMIN — crear evento', () => {
  it('TEST-FE-ADM-001 / AC-FE-017: campos vacíos → errores por campo y 0 peticiones POST', async () => {
    const peticiones = espiarPeticiones()
    const { user } = renderApp({ ruta: '/admin/eventos/nuevo', rol: 'ADMIN' })
    await user.click(await screen.findByRole('button', { name: 'Crear evento' }))
    expect(await screen.findByText('El código es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('La descripción es obligatoria')).toBeInTheDocument()
    expect(screen.getByText('La fecha y hora son obligatorias')).toBeInTheDocument()
    expect(screen.getByText('Selecciona una sede', { selector: 'p' })).toBeInTheDocument()
    expect(peticiones.filter((p) => p.metodo === 'POST')).toHaveLength(0)
  })

  it('TEST-FE-ADM-002: 201 → navega a la gestión del evento y lo recuerda en la sesión', async () => {
    let cuerpo: unknown
    server.use(
      http.post(`${API}/events`, async ({ request }) => {
        cuerpo = await request.json()
        return HttpResponse.json({ ...eventoBorrador, eventCode: 'NEW-2027', title: 'Festival Nuevo' }, { status: 201 })
      }),
    )
    const { user, router } = renderApp({ ruta: '/admin/eventos/nuevo', rol: 'ADMIN' })
    await llenarEvento(user)
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))
    expect(await screen.findByRole('heading', { name: 'Festival Nuevo' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/admin/eventos/NEW-2027')
    expect(cuerpo).toMatchObject({
      eventCode: 'NEW-2027',
      name: 'Festival Nuevo',
      category: 'MUSIC',
      minimumAge: 18, // número, no string
      venueCode: 'VEN-SMR-01',
      eventDate: '2027-12-12T20:00',
    })
    // aparece en "Creados en esta sesión"
    await user.click(within(screen.getByRole('main')).getByRole('link', { name: 'Eventos' }))
    expect(await screen.findByText('NEW-2027')).toBeInTheDocument()
  })

  it('TEST-FE-ADM-003: 400 con details → errores en los campos homónimos', async () => {
    server.use(
      http.post(`${API}/events`, () =>
        errorApi(400, 'Validation failed', { eventDate: 'La fecha debe ser futura (servidor)' }),
      ),
    )
    const { user } = renderApp({ ruta: '/admin/eventos/nuevo', rol: 'ADMIN' })
    await llenarEvento(user)
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))
    expect(await screen.findByText('La fecha debe ser futura (servidor)')).toBeInTheDocument()
    expect(screen.getByLabelText('Fecha y hora')).toHaveAttribute('aria-invalid', 'true')
  })

  it('409 (código duplicado) → aviso arriba del formulario', async () => {
    server.use(http.post(`${API}/events`, () => errorApi(409, 'El código de evento ya existe: NEW-2027')))
    const { user } = renderApp({ ruta: '/admin/eventos/nuevo', rol: 'ADMIN' })
    await llenarEvento(user)
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('El código de evento ya existe: NEW-2027')
  })

  it('403 del servidor → redirige a /403', async () => {
    server.use(http.post(`${API}/events`, () => errorApi(403, 'Forbidden')))
    const { user, router } = renderApp({ ruta: '/admin/eventos/nuevo', rol: 'ADMIN' })
    await llenarEvento(user)
    await user.click(screen.getByRole('button', { name: 'Crear evento' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/403'))
  })
})

describe('ADMIN — gestionar evento', () => {
  it('TEST-FE-ADM-004 / AC-FE-018: publicar un DRAFT → badge PUBLISHED', async () => {
    let publicado = false
    server.use(
      http.get(`${API}/events/:code`, () =>
        HttpResponse.json({ ...eventoBorrador, status: publicado ? 'PUBLISHED' : 'DRAFT' }),
      ),
      http.patch(`${API}/events/:code/publish`, () => {
        publicado = true
        return HttpResponse.json({ ...eventoBorrador, status: 'PUBLISHED' })
      }),
    )
    const { user } = renderApp({ ruta: '/admin/eventos/DRF-2027', rol: 'ADMIN' })
    expect(await screen.findByText('DRAFT')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Publicar evento' }))
    const dialogo = await screen.findByRole('dialog', { name: 'Publicar evento' })
    await user.click(within(dialogo).getByRole('button', { name: 'Publicar' }))
    expect(await screen.findByText('Evento publicado.')).toBeInTheDocument()
    expect(await screen.findByText('PUBLISHED')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Publicar evento' })).toBeDisabled() // solo DRAFT se publica
  })

  it('TEST-FE-ADM-005: publicar → 409 visible en el modal', async () => {
    server.use(
      http.get(`${API}/events/:code`, () => HttpResponse.json(eventoBorrador)),
      http.patch(`${API}/events/:code/publish`, () => errorApi(409, 'Transición de estado inválida.')),
    )
    const { user } = renderApp({ ruta: '/admin/eventos/DRF-2027', rol: 'ADMIN' })
    await user.click(await screen.findByRole('button', { name: 'Publicar evento' }))
    const dialogo = await screen.findByRole('dialog')
    await user.click(within(dialogo).getByRole('button', { name: 'Publicar' }))
    expect(await within(dialogo).findByRole('alert')).toHaveTextContent('Transición de estado inválida.')
  })

  it('TEST-FE-ADM-006: asociar artista → aparece en la lista; duplicado → 409', async () => {
    let asociado = false
    server.use(
      http.get(`${API}/events/:code`, () =>
        HttpResponse.json({ ...eventoBorrador, artists: asociado ? [artistas[1]] : [] }),
      ),
      http.post(`${API}/events/:code/artists/:id`, () => {
        asociado = true
        return HttpResponse.json({ ...eventoBorrador, artists: [artistas[1]] })
      }),
    )
    const { user } = renderApp({ ruta: '/admin/eventos/DRF-2027', rol: 'ADMIN' })
    await screen.findByText('Aún no hay artistas asociados.')
    await screen.findByRole('option', { name: 'Neon Waves' })
    await user.selectOptions(screen.getByLabelText('Agregar artista'), 'Neon Waves')
    await user.click(screen.getByRole('button', { name: /Asociar/ }))
    expect(await screen.findByText('Artista asociado.')).toBeInTheDocument()
    expect(await screen.findByText('Neon Waves', { selector: 'li' })).toBeInTheDocument()
    // la UI bloquea artistas ya asociados (el backend sigue siendo la autoridad)
    expect(screen.queryByRole('option', { name: 'Neon Waves' })).not.toBeInTheDocument()
  })

  it('asociar duplicado → 409 en aviso', async () => {
    server.use(
      http.get(`${API}/events/:code`, () => HttpResponse.json(eventoBorrador)),
      http.post(`${API}/events/:code/artists/:id`, () => errorApi(409, 'El artista ya está asociado al evento.')),
    )
    const { user } = renderApp({ ruta: '/admin/eventos/DRF-2027', rol: 'ADMIN' })
    await screen.findByRole('option', { name: 'Solar Beat' })
    await user.selectOptions(screen.getByLabelText('Agregar artista'), 'Solar Beat')
    await user.click(screen.getByRole('button', { name: /Asociar/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('El artista ya está asociado al evento.')
  })

  it('evento inexistente → "Evento no encontrado"', async () => {
    renderApp({ ruta: '/admin/eventos/NO-EXISTE', rol: 'ADMIN' })
    expect(await screen.findByText('Evento no encontrado')).toBeInTheDocument()
  })

  it('"Abrir" busca un evento por código', async () => {
    const { user, router } = renderApp({ ruta: '/admin/eventos', rol: 'ADMIN' })
    await user.type(await screen.findByRole('textbox', { name: 'Buscar evento por código' }), 'DRF-2027')
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    await screen.findByRole('heading', { name: 'Evento en borrador' })
    expect(router.state.location.pathname).toBe('/admin/eventos/DRF-2027')
  })
})
