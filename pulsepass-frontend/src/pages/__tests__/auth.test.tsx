import { screen, waitFor, within } from '@testing-library/react'
import type userEvent from '@testing-library/user-event'
import { http } from 'msw'
import { describe, expect, it } from 'vitest'
import { API, errorApi } from '../../test/mocks/handlers'
import { server } from '../../test/setup'
import { espiarPeticiones, renderApp } from '../../test/utils'

type Usuario = ReturnType<typeof userEvent.setup>

async function iniciarSesion(user: Usuario, identifier = 'andrea', password = 'Password-12345') {
  await user.type(await screen.findByLabelText('Usuario o correo'), identifier)
  await user.type(screen.getByLabelText('Contraseña'), password)
  await user.click(screen.getByRole('button', { name: 'Ingresar' }))
}

async function llenarRegistro(user: Usuario, password: string, email = 'nuevo@pulsepass.test') {
  await user.type(await screen.findByLabelText('Nombre de usuario'), 'nuevo')
  await user.type(screen.getByLabelText('Correo electrónico'), email)
  await user.type(screen.getByLabelText('Nombres'), 'Nuevo')
  await user.type(screen.getByLabelText('Apellidos'), 'Usuario')
  await user.type(screen.getByLabelText('Teléfono'), '3001112233')
  await user.type(screen.getByLabelText('Ciudad'), 'Santa Marta')
  await user.type(screen.getByLabelText('Fecha de nacimiento'), '1998-04-12')
  await user.type(screen.getByLabelText(/^Contraseña/), password)
}

describe('Login', () => {
  it('TEST-FE-AUTH-001 / AC-FE-009: login válido → sesión, nombre en navbar y redirección a "desde"', async () => {
    const { user } = renderApp({ ruta: '/login', state: { desde: '/eventos' } })
    await iniciarSesion(user)
    expect(await screen.findByRole('heading', { name: 'Cartelera' })).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /Andrea/ })).toBeInTheDocument()
    // el token solo vive en sessionStorage/memoria, nunca en localStorage
    expect(sessionStorage.getItem('pulsepass.sesion')).toContain('tok-USER')
    expect(sessionStorage.getItem('pulsepass.sesion')).not.toContain('Password')
    expect(JSON.stringify({ ...localStorage })).not.toContain('tok-USER')
  })

  it('TEST-FE-AUTH-002 / AC-FE-008: 401 → "Credenciales inválidas" genérico', async () => {
    const { user } = renderApp({ ruta: '/login' })
    await iniciarSesion(user, 'andrea', 'incorrecta-123')
    expect(await screen.findByRole('alert')).toHaveTextContent('Credenciales inválidas.')
  })

  it('TEST-FE-AUTH-003: sin campos → errores y 0 peticiones', async () => {
    const peticiones = espiarPeticiones()
    const { user } = renderApp({ ruta: '/login' })
    await user.click(await screen.findByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText('Ingresa tu usuario o correo')).toBeInTheDocument()
    expect(screen.getByText('Ingresa tu contraseña')).toBeInTheDocument()
    expect(peticiones.filter((p) => p.url.startsWith('/api/auth'))).toHaveLength(0)
  })

  it('mostrar/ocultar contraseña', async () => {
    const { user } = renderApp({ ruta: '/login' })
    const campo = await screen.findByLabelText('Contraseña')
    expect(campo).toHaveAttribute('type', 'password')
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))
    expect(campo).toHaveAttribute('type', 'text')
  })

  it('con sesión activa /login redirige al inicio', async () => {
    renderApp({ ruta: '/login', rol: 'USER' })
    expect(await screen.findByRole('heading', { name: 'Descubre los mejores eventos' })).toBeInTheDocument()
  })
})

describe('Registro', () => {
  it('TEST-FE-AUTH-004 / AC-FE-005: contraseña de 11 caracteres → error y 0 peticiones', async () => {
    const peticiones = espiarPeticiones()
    const { user } = renderApp({ ruta: '/registro' })
    await llenarRegistro(user, 'Corta-12345')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByText('La contraseña debe tener al menos 12 caracteres')).toBeInTheDocument()
    expect(peticiones.filter((p) => p.metodo === 'POST')).toHaveLength(0)
  })

  it('TEST-FE-AUTH-005 / AC-FE-006: 201 → redirige a /login con aviso', async () => {
    const { user, router } = renderApp({ ruta: '/registro' })
    await llenarRegistro(user, 'Contrasena-segura-1')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByText('Cuenta creada, inicia sesión.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('TEST-FE-AUTH-006 / AC-FE-007: 409 → mensaje genérico sin detalles internos', async () => {
    const { user } = renderApp({ ruta: '/registro' })
    await llenarRegistro(user, 'Contrasena-segura-1', 'dup@pulsepass.test')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    const alerta = await screen.findByRole('alert')
    expect(alerta).toHaveTextContent('El usuario o correo ya está registrado.')
    expect(alerta).not.toHaveTextContent('dup@pulsepass.test')
  })

  it('400 con details → se asignan al campo homónimo', async () => {
    server.use(
      http.post(`${API}/users`, () => errorApi(400, 'Validation failed', { email: 'formato de correo inválido (servidor)' })),
    )
    const { user } = renderApp({ ruta: '/registro' })
    await llenarRegistro(user, 'Contrasena-segura-1')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByText('formato de correo inválido (servidor)')).toBeInTheDocument()
  })
})

describe('Guardas de ruta y sesión', () => {
  it('TEST-FE-AUTH-007 / AC-FE-004: anónimo → /login y, tras ingresar, vuelve a la ruta de origen', async () => {
    const { user, router } = renderApp({ ruta: '/cuenta' })
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(router.state.location.state).toMatchObject({ desde: '/cuenta' })
    await iniciarSesion(user)
    expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/cuenta')
  })

  it('TEST-FE-AUTH-008 / AC-FE-015: USER en /admin/eventos → /403', async () => {
    const { router } = renderApp({ ruta: '/admin/eventos', rol: 'USER' })
    expect(await screen.findByText('No tienes permisos para acceder a esta sección.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/403')
  })

  it('TEST-FE-AUTH-009: ADMIN en /admin/eventos → renderiza', async () => {
    renderApp({ ruta: '/admin/eventos', rol: 'ADMIN' })
    expect(await screen.findByRole('heading', { name: 'Administración de eventos' })).toBeInTheDocument()
  })

  it('STAFF no accede a /admin y USER no accede a /staff', async () => {
    const a = renderApp({ ruta: '/admin/eventos', rol: 'STAFF' })
    await screen.findByText('No tienes permisos para acceder a esta sección.')
    a.router.dispose()
  })

  it('TEST-FE-AUTH-010: cerrar sesión limpia token y caché', async () => {
    const { user, queryClient } = renderApp({ ruta: '/', rol: 'USER' })
    await user.click(await screen.findByRole('button', { name: /Andrea/ }))
    expect(queryClient.getQueryData(['usuario', 'andrea@pulsepass.test'])).toBeDefined()
    await user.click(screen.getByRole('menuitem', { name: 'Salir' }))
    await waitFor(() => expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull())
    expect(queryClient.getQueryData(['usuario', 'andrea@pulsepass.test'])).toBeUndefined()
    const nav = screen.getByRole('navigation', { name: 'Principal' })
    expect(nav).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Ingresar' })).toBeInTheDocument()
  })

  it('TEST-FE-AUTH-011: token expirado al restaurar la sesión → anónimo', async () => {
    renderApp({ ruta: '/', rol: 'USER', tokenVencido: true })
    expect(await screen.findByRole('link', { name: 'Ingresar' })).toBeInTheDocument()
    expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
  })

  it('recarga con token vigente conserva la sesión (restaura vía /auth/me)', async () => {
    renderApp({ ruta: '/mis-tickets', rol: 'USER' })
    expect(await screen.findByRole('heading', { name: 'Mis tickets' })).toBeInTheDocument()
    // esperar los datos evita dejar peticiones en vuelo que contaminen la prueba siguiente
    expect(await screen.findByText('TKT-8F2A1C')).toBeInTheDocument()
  })

  it('AC-FE-019 / UC-FE-11: un 401 en ruta protegida cierra sesión, limpia caché y avisa en /login', async () => {
    server.use(http.get(`${API}/tickets/by-user`, () => errorApi(401, 'Unauthorized')))
    const { router, queryClient } = renderApp({ ruta: '/mis-tickets', rol: 'USER' })
    expect(await screen.findByRole('heading', { name: 'Inicia sesión' })).toBeInTheDocument()
    expect(screen.getByText('Tu sesión expiró. Inicia sesión de nuevo.')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(queryClient.getQueryCache().getAll().filter((q) => q.queryKey[0] === 'tickets')).toHaveLength(0)
    expect(sessionStorage.getItem('pulsepass.sesion')).toBeNull()
  })

  it('el token viaja solo en el encabezado Authorization (QT-FE-007)', async () => {
    const peticiones = espiarPeticiones()
    renderApp({ ruta: '/mis-tickets', rol: 'USER' })
    await screen.findByText('TKT-8F2A1C') // espera a que la consulta privada se haya hecho
    const privadas = peticiones.filter((p) => p.url === '/api/tickets/by-user')
    expect(privadas.length).toBeGreaterThan(0)
    privadas.forEach((p) => {
      expect(p.auth).toBe('Bearer tok-USER')
      expect(p.url).not.toContain('tok-USER')
    })
  })
})

describe('Navbar y layout', () => {
  const enNavegacion = () => within(screen.getByRole('navigation', { name: 'Principal' }))

  it('TEST-FE-GEN-003: anónimo', async () => {
    renderApp()
    await screen.findByRole('heading', { name: 'Descubre los mejores eventos' })
    expect(enNavegacion().getByRole('link', { name: 'Eventos' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Registrarse' }).length).toBeGreaterThan(0)
    expect(enNavegacion().queryByRole('link', { name: 'Mis tickets' })).not.toBeInTheDocument()
  })

  it('TEST-FE-GEN-003: USER ve "Mis tickets", no ve staff ni admin', async () => {
    renderApp({ rol: 'USER' })
    expect(await enNavegacion().findByRole('link', { name: 'Mis tickets' })).toBeInTheDocument()
    expect(enNavegacion().queryByRole('link', { name: 'Validar ingreso' })).not.toBeInTheDocument()
    expect(enNavegacion().queryByRole('link', { name: 'Administrar eventos' })).not.toBeInTheDocument()
  })

  it('TEST-FE-GEN-003: STAFF ve validación y tickets pagados', async () => {
    renderApp({ rol: 'STAFF' })
    expect(await enNavegacion().findByRole('link', { name: 'Validar ingreso' })).toBeInTheDocument()
    expect(enNavegacion().getByRole('link', { name: 'Tickets pagados' })).toBeInTheDocument()
    expect(enNavegacion().queryByRole('link', { name: 'Mis tickets' })).not.toBeInTheDocument()
    expect(enNavegacion().queryByRole('link', { name: 'Administrar eventos' })).not.toBeInTheDocument()
  })

  it('TEST-FE-GEN-003: ADMIN ve además "Administrar eventos"', async () => {
    renderApp({ rol: 'ADMIN' })
    expect(await enNavegacion().findByRole('link', { name: 'Administrar eventos' })).toBeInTheDocument()
    expect(enNavegacion().getByRole('link', { name: 'Validar ingreso' })).toBeInTheDocument()
  })

  it('TEST-FE-GEN-004: el menú móvil abre y cierra con el teclado', async () => {
    const { user } = renderApp()
    const boton = await screen.findByRole('button', { name: 'Abrir menú' })
    boton.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('navigation', { name: 'Menú móvil' })).toBeInTheDocument()
    expect(boton).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('navigation', { name: 'Menú móvil' })).not.toBeInTheDocument()
  })

  it('incluye el enlace "Saltar al contenido" y <main id="contenido">', async () => {
    renderApp()
    expect(await screen.findByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute('href', '#contenido')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'contenido')
  })
})
