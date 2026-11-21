import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router'
import clsx from 'clsx'
import BotonTema from '../componentes/BotonTema'
import { clasesBoton } from '../componentes/Boton'
import { Icono } from '../componentes/Iconos'
import { useAuth } from '../funcionalidades/auth/hooks'
import { RUTAS } from '../lib/rutas'
import MenuUsuario from './MenuUsuario'

interface Enlace {
  a: string
  texto: string
  fin?: boolean
}

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-marca-50 text-marca-700 dark:bg-indigo-950 dark:text-indigo-200'
      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
  )

function Logo() {
  return (
    <Link to={RUTAS.inicio} className="flex items-center gap-2 font-titulo text-lg font-bold">
      <span className="inline-flex size-8 items-center justify-center rounded-lg bg-marca-600 text-white">
        <Icono nombre="musica" className="size-4" />
      </span>
      PulsePass
    </Link>
  )
}

export default function Navbar() {
  const { sesion, tieneRol, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  // Enlaces según el rol (tabla 8.4 del PRD)
  const enlaces: Enlace[] = [
    { a: RUTAS.eventos, texto: 'Eventos' },
    { a: RUTAS.artistas, texto: 'Artistas' },
    { a: RUTAS.sedes, texto: 'Sedes' },
  ]
  if (tieneRol('USER')) enlaces.push({ a: RUTAS.misTickets, texto: 'Mis tickets' })
  if (tieneRol('STAFF', 'ADMIN')) {
    enlaces.push({ a: RUTAS.validacion, texto: 'Validar ingreso' })
    enlaces.push({ a: RUTAS.ticketsPagados(), texto: 'Tickets pagados' })
  }
  if (tieneRol('ADMIN')) enlaces.push({ a: RUTAS.adminEventos, texto: 'Administrar eventos' })

  const autenticado = sesion.estado === 'autenticado'
  const anonimo = sesion.estado === 'anonimo'

  useEffect(() => {
    if (!menuAbierto) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenuAbierto(false)
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [menuAbierto])

  const cerrar = () => setMenuAbierto(false)
  const salir = () => {
    cerrar()
    cerrarSesion()
    void navigate(RUTAS.inicio)
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-2">
        <Logo />
        <nav aria-label="Principal" className="ml-4 hidden items-center gap-1 md:flex">
          {enlaces.map((e) => (
            <NavLink key={e.a} to={e.a} end={e.fin} className={claseEnlace}>
              {e.texto}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <BotonTema />
          <div className="hidden items-center gap-2 md:flex">
            {anonimo && (
              <>
                <Link to={RUTAS.login} className={clasesBoton('fantasma')}>
                  Ingresar
                </Link>
                <Link to={RUTAS.registro} className={clasesBoton('primario')}>
                  Registrarse
                </Link>
              </>
            )}
            {autenticado && <MenuUsuario />}
          </div>
          <button
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-slate-100 md:hidden dark:hover:bg-slate-800"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            onClick={() => setMenuAbierto((v) => !v)}
          >
            <Icono nombre={menuAbierto ? 'cerrar' : 'menu'} className="size-6" />
          </button>
        </div>
      </div>

      {menuAbierto && (
        <nav
          id="menu-movil"
          aria-label="Menú móvil"
          className="border-t border-slate-200 px-4 py-3 md:hidden dark:border-slate-800"
        >
          <ul className="space-y-1">
            {enlaces.map((e) => (
              <li key={e.a}>
                <NavLink to={e.a} end={e.fin} onClick={cerrar} className={(s) => clsx(claseEnlace(s), 'block text-base')}>
                  {e.texto}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-200 pt-3 dark:border-slate-800">
            {anonimo && (
              <>
                <Link to={RUTAS.login} onClick={cerrar} className={clasesBoton('secundario')}>
                  Ingresar
                </Link>
                <Link to={RUTAS.registro} onClick={cerrar} className={clasesBoton('primario')}>
                  Registrarse
                </Link>
              </>
            )}
            {autenticado && (
              <>
                <Link to={RUTAS.cuenta} onClick={cerrar} className={clasesBoton('secundario')}>
                  Mi cuenta
                </Link>
                <button type="button" onClick={salir} className={clasesBoton('fantasma')}>
                  Salir
                </button>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
