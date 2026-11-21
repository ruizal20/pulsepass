import { Link, useNavigate } from 'react-router'
import Avatar from '../componentes/Avatar'
import Badge from '../componentes/Badge'
import Boton, { clasesBoton } from '../componentes/Boton'
import { Pagina } from '../componentes/Contenedor'
import { Cargando, EstadoError } from '../componentes/Estados'
import { Icono } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { useAuth } from '../funcionalidades/auth/hooks'
import { useUsuarioPorEmail } from '../funcionalidades/usuarios/hooks'
import { mensajeDeError } from '../lib/errores'
import { formatearFechaNacimiento } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

export default function Cuenta() {
  const { sesion, tieneRol, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const email = sesion.estado === 'autenticado' ? sesion.usuario.email : undefined
  const usuario = useUsuarioPorEmail(email)

  if (sesion.estado !== 'autenticado') return null
  const perfil = usuario.data?.profile
  const nombre = perfil ? `${perfil.firstName} ${perfil.lastName}` : sesion.usuario.username

  const salir = () => {
    cerrarSesion()
    void navigate(RUTAS.inicio)
  }

  return (
    <Pagina>
      <h1 className="mb-6 text-3xl font-extrabold">Mi cuenta</h1>
      {usuario.isPending && <Cargando forma="lista" filas={1} />}
      {/* El perfil es complementario: si falla, igual mostramos los datos de la sesión */}
      {usuario.isError && (
        <div className="mb-4">
          <EstadoError mensaje={mensajeDeError(usuario.error)} onReintentar={() => void usuario.refetch()} />
        </div>
      )}
      {!usuario.isPending && (
        <Tarjeta className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar nombre={nombre} tamano="md" />
            <div>
              <p className="text-lg font-bold">{nombre}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                @{sesion.usuario.username} · {sesion.usuario.email}
              </p>
              {perfil?.birthDate && (
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Nacimiento: {formatearFechaNacimiento(perfil.birthDate)}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-2">
              Rol:
              {sesion.usuario.roles.map((r) => (
                <Badge key={r} tono="ROL">
                  {r}
                </Badge>
              ))}
            </p>
            {usuario.data?.active != null && (
              <p className="flex items-center gap-2">
                Estado:
                <Badge tono={usuario.data.active ? 'ACTIVA' : 'INACTIVA'}>
                  {usuario.data.active ? 'Activa' : 'Inactiva'}
                </Badge>
              </p>
            )}
          </div>
        </Tarjeta>
      )}
      <div className="mt-4 flex flex-wrap justify-between gap-3">
        {tieneRol('USER') ? (
          <Link to={RUTAS.misTickets} className={clasesBoton('primario')}>
            <Icono nombre="ticket" className="size-4" /> Ver mis tickets
          </Link>
        ) : (
          <span />
        )}
        <Boton variante="secundario" onClick={salir}>
          Cerrar sesión
        </Boton>
      </div>
    </Pagina>
  )
}
