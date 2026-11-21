import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Avatar from '../componentes/Avatar'
import { Icono } from '../componentes/Iconos'
import { useAuth } from '../funcionalidades/auth/hooks'
import { useUsuarioPorEmail } from '../funcionalidades/usuarios/hooks'
import { RUTAS } from '../lib/rutas'

export default function MenuUsuario() {
  const { sesion, tieneRol, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : undefined
  const { data: usuario } = useUsuarioPorEmail(email)

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  if (sesion.estado !== 'autenticado') return null
  const nombre = usuario?.profile?.firstName ?? sesion.usuario.username

  const salir = () => {
    setAbierto(false)
    cerrarSesion()
    void navigate(RUTAS.inicio)
  }

  const item =
    'block w-full px-4 py-2.5 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800'

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        className="flex min-h-11 items-center gap-2 rounded-full border border-slate-200 py-1 pr-3 pl-1 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
      >
        <Avatar nombre={nombre} tamano="sm" />
        <span className="max-w-32 truncate">{nombre}</span>
        <Icono nombre="chevron" className="size-4" />
      </button>
      {abierto && (
        <ul
          role="menu"
          className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
        >
          <li role="none">
            <Link role="menuitem" to={RUTAS.cuenta} className={item} onClick={() => setAbierto(false)}>
              Mi cuenta
            </Link>
          </li>
          {tieneRol('USER') && (
            <li role="none">
              <Link
                role="menuitem"
                to={RUTAS.misTickets}
                className={item}
                onClick={() => setAbierto(false)}
              >
                Mis tickets
              </Link>
            </li>
          )}
          <li role="none">
            <button role="menuitem" type="button" onClick={salir} className={item}>
              Salir
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
