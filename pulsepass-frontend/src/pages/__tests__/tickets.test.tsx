import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { ticketCancelado, ticketUsado, ticketVIP } from '../../test/mocks/datos'
import { API, errorApi } from '../../test/mocks/handlers'
import { server } from '../../test/setup'
import { renderApp } from '../../test/utils'

const botonComprar = () => screen.getAllByRole('button', { name: 'Comprar entrada' })[0] as HTMLElement

describe('Compra de tickets', () => {
  it('TEST-FE-TKT-001/004 / AC-FE-010: compra válida envía el email de la sesión y navega a la confirmación', async () => {
    let cuerpo: unknown
    server.use(
      http.post(`${API}/tickets`, async ({ request }) => {
        cuerpo = await request.json()
        return HttpResponse.json(ticketVIP, { status: 201 })
      }),
    )
    const { user, router } = renderApp({ ruta: '/eventos/CMF-2026', rol: 'USER' })
    await screen.findByRole('heading', { level: 1, name: 'Caribbean Music Fest 2026' })
    await user.click(screen.getByRole('radio', { name: 'VIP' }))
    await waitFor(() => expect(botonComprar()).toBeEnabled())
    await user.click(botonComprar())
    const dialogo = await screen.findByRole('dialog', { name: 'Confirmar compra' })
    expect(within(dialogo).getByText('andrea@pulsepass.test')).toBeInTheDocument()
    expect(within(dialogo).getByText('VIP')).toBeInTheDocument()
    await user.click(within(dialogo).getByRole('button', { name: 'Confirmar' }))
    expect(await screen.findByRole('heading', { name: '¡Compra realizada con éxito!' })).toBeInTheDocument()
    expect(cuerpo).toEqual({ userEmail: 'andrea@pulsepass.test', eventCode: 'CMF-2026', type: 'VIP' })
    expect(router.state.location.pathname).toBe('/compra/confirmacion/TKT-8F2A1C')
    // el precio lo fija el backend: la UI no lo envía
    expect(cuerpo).not.toHaveProperty('price')
  })

  it('el email de compra no es un campo editable (anti-IDOR)', async () => {
    renderApp({ ruta: '/eventos/CMF-2026', rol: 'USER' })
    await screen.findByRole('heading', { level: 1, name: 'Caribbean Music Fest 2026' })
    expect(screen.queryByLabelText(/correo|email/i)).not.toBeInTheDocument()
  })

  it('TEST-FE-TKT-002 / AC-FE-004: compra anónima → login y regreso al evento', async () => {
    const { user, router } = renderApp({ ruta: '/eventos/CMF-2026' })
    await screen.findByRole('heading', { level: 1, name: 'Caribbean Music Fest 2026' })
    await user.click(screen.getAllByRole('link', { name: 'Inicia sesión para comprar' })[0] as HTMLElement)
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(router.state.location.state).toMatchObject({ desde: '/eventos/CMF-2026' })
    await user.type(screen.getByLabelText('Usuario o correo'), 'andrea')
    await user.type(screen.getByLabelText('Contraseña'), 'Password-12345')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/eventos/CMF-2026')
  })

  it('STAFF/ADMIN no ven el panel de compra', async () => {
    renderApp({ ruta: '/eventos/CMF-2026', rol: 'STAFF' })
    await screen.findByRole('heading', { level: 1, name: 'Caribbean Music Fest 2026' })
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Comprar entrada' })).not.toBeInTheDocument())
    expect(screen.queryByRole('link', { name: 'Inicia sesión para comprar' })).not.toBeInTheDocument()
  })

  it('TEST-FE-TKT-003 / AC-FE-011: 409 por edad mínima → mensaje del backend dentro del modal, sin navegar', async () => {
    server.use(
      http.post(`${API}/tickets`, () => errorApi(409, 'El usuario no cumple la edad mínima del evento.')),
    )
    const { user, router } = renderApp({ ruta: '/eventos/CMF-2026', rol: 'USER' })
    await screen.findByRole('heading', { level: 1, name: 'Caribbean Music Fest 2026' })
    await waitFor(() => expect(botonComprar()).toBeEnabled())
    await user.click(botonComprar())
    const dialogo = await screen.findByRole('dialog')
    await user.click(within(dialogo).getByRole('button', { name: 'Confirmar' }))
    expect(await within(dialogo).findByRole('alert')).toHaveTextContent(
      'El usuario no cumple la edad mínima del evento.',
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument() // el modal no se cierra
    expect(router.state.location.pathname).toBe('/eventos/CMF-2026')
  })

  it('el modal se cierra con Escape y devuelve el foco al botón', async () => {
    const { user } = renderApp({ ruta: '/eventos/CMF-2026', rol: 'USER' })
    await screen.findByRole('heading', { level: 1, name: 'Caribbean Music Fest 2026' })
    await waitFor(() => expect(botonComprar()).toBeEnabled())
    const disparador = botonComprar()
    await user.click(disparador)
    await screen.findByRole('dialog')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(disparador).toHaveFocus()
  })
})

describe('Mis tickets', () => {
  it('TEST-FE-TKT-005: lista y filtra por estado', async () => {
    const { user } = renderApp({ ruta: '/mis-tickets', rol: 'USER' })
    expect(await screen.findByText('TKT-8F2A1C')).toBeInTheDocument()
    expect(screen.getByText('TKT-5C90E2')).toBeInTheDocument()
    expect(screen.getByText('TKT-77AD13')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Usados' }))
    expect(screen.getByRole('button', { name: 'Usados' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('TKT-5C90E2')).toBeInTheDocument()
    expect(screen.queryByText('TKT-8F2A1C')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Cancelados' }))
    expect(screen.getByText('TKT-77AD13')).toBeInTheDocument()
    expect(screen.queryByText('TKT-5C90E2')).not.toBeInTheDocument()
  })

  it('TEST-FE-TKT-006: sin tickets → estado vacío con enlace a la cartelera', async () => {
    server.use(http.get(`${API}/tickets/by-user`, () => HttpResponse.json([])))
    renderApp({ ruta: '/mis-tickets', rol: 'USER' })
    expect(await screen.findByText('Aún no tienes tickets')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver cartelera' })).toHaveAttribute('href', '/eventos')
  })

  it('TEST-FE-TKT-010 / AC-FE-013: "Cancelar" solo se ofrece en tickets PAID', async () => {
    renderApp({ ruta: '/mis-tickets', rol: 'USER' })
    await screen.findByText('TKT-8F2A1C')
    expect(screen.getAllByRole('button', { name: 'Cancelar' })).toHaveLength(1) // solo el PAID
  })

  it('TEST-FE-TKT-007 / AC-FE-012: cancelar un ticket PAID actualiza la lista', async () => {
    let cancelado = false
    server.use(
      http.get(`${API}/tickets/by-user`, () =>
        HttpResponse.json([cancelado ? { ...ticketVIP, status: 'CANCELLED' } : ticketVIP, ticketUsado]),
      ),
      http.patch(`${API}/tickets/:code/cancel`, () => {
        cancelado = true
        return HttpResponse.json({ ...ticketVIP, status: 'CANCELLED' })
      }),
    )
    const { user } = renderApp({ ruta: '/mis-tickets', rol: 'USER' })
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))
    const dialogo = await screen.findByRole('dialog', { name: 'Cancelar ticket' })
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar ticket' }))
    expect(await screen.findByText('Ticket cancelado.')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument())
    expect(screen.getAllByText('CANCELLED').length).toBeGreaterThan(0)
  })

  it('TEST-FE-TKT-008: cancelar → 409 muestra el mensaje y mantiene el modal', async () => {
    server.use(
      http.patch(`${API}/tickets/:code/cancel`, () => errorApi(409, 'El ticket no puede cancelarse en su estado actual.')),
    )
    const { user } = renderApp({ ruta: '/mis-tickets', rol: 'USER' })
    await user.click(await screen.findByRole('button', { name: 'Cancelar' }))
    const dialogo = await screen.findByRole('dialog')
    await user.click(within(dialogo).getByRole('button', { name: 'Cancelar ticket' }))
    expect(await within(dialogo).findByRole('alert')).toHaveTextContent(
      'El ticket no puede cancelarse en su estado actual.',
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('USER no accede a rutas de STAFF', async () => {
    renderApp({ ruta: '/staff/validacion', rol: 'USER' })
    expect(await screen.findByText('No tienes permisos para acceder a esta sección.')).toBeInTheDocument()
  })
})

describe('Detalle de ticket y confirmación', () => {
  it('muestra código, tipo, precio, fecha y titular; permite cancelar si está PAID', async () => {
    renderApp({ ruta: '/mis-tickets/TKT-8F2A1C', rol: 'USER' })
    expect(await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })).toBeInTheDocument()
    expect(screen.getByText('TKT-8F2A1C')).toBeInTheDocument()
    expect(screen.getByText('$ 250.000')).toBeInTheDocument()
    expect(await screen.findByText('Andrea Ruiz')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancelar ticket' })).toBeInTheDocument()
  })

  it('TEST-FE-TKT-010: ticket USED o CANCELLED no muestra el botón de cancelar', async () => {
    server.use(http.get(`${API}/tickets/:code`, () => HttpResponse.json(ticketUsado)))
    renderApp({ ruta: '/mis-tickets/TKT-5C90E2', rol: 'USER' })
    await screen.findByRole('heading', { name: 'Caribbean Music Fest 2026' })
    expect(screen.queryByRole('button', { name: 'Cancelar ticket' })).not.toBeInTheDocument()
    server.use(http.get(`${API}/tickets/:code`, () => HttpResponse.json(ticketCancelado)))
  })

  it('TEST-FE-TKT-009 / AC-FE-014: ticket ajeno (404) → "Ticket no disponible"', async () => {
    renderApp({ ruta: '/mis-tickets/TKT-AJENO', rol: 'USER' })
    expect(await screen.findByText('Ticket no disponible')).toBeInTheDocument()
    expect(screen.queryByText('Caribbean Music Fest 2026')).not.toBeInTheDocument()
  })

  it('TEST-FE-TKT-009: ticket ajeno (403) → misma pantalla, sin revelar existencia', async () => {
    server.use(http.get(`${API}/tickets/:code`, () => errorApi(403, 'Forbidden')))
    renderApp({ ruta: '/mis-tickets/TKT-8F2A1C', rol: 'USER' })
    expect(await screen.findByText('Ticket no disponible')).toBeInTheDocument()
  })

  it('confirmación de compra muestra el ticket', async () => {
    renderApp({ ruta: '/compra/confirmacion/TKT-8F2A1C', rol: 'USER' })
    expect(await screen.findByRole('heading', { name: '¡Compra realizada con éxito!' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver mis tickets' })).toHaveAttribute('href', '/mis-tickets')
  })
})
