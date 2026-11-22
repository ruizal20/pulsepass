import { Link } from 'react-router'
import Avatar from '../componentes/Avatar'
import { clasesBoton } from '../componentes/Boton'
import { Pagina } from '../componentes/Contenedor'
import { Cargando, EstadoError, EstadoVacio } from '../componentes/Estados'
import { Icono } from '../componentes/Iconos'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { useAuth } from '../funcionalidades/auth/hooks'
import GrillaEventos from '../funcionalidades/eventos/componentes/GrillaEventos'
import { useEventosPublicados } from '../funcionalidades/eventos/hooks'
import { mensajeDeError } from '../lib/errores'
import { RUTAS } from '../lib/rutas'

function VerTodos({ a }: { a: string }) {
  return (
    <Link to={a} className="flex items-center gap-1 text-sm font-semibold text-marca-600 hover:underline dark:text-marca-500">
      Ver todos <Icono nombre="flecha" className="size-4" />
    </Link>
  )
}

export default function Inicio() {
  const { sesion } = useAuth()
  const eventos = useEventosPublicados()
  const artistas = useArtistasActivos()

  return (
    <>
      <section className="bg-linear-to-r from-marca-600 to-acento-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14 md:py-20">
          <h1 className="max-w-md text-4xl leading-tight font-extrabold md:text-5xl">
            Descubre los mejores eventos
          </h1>
          <p className="mt-4 max-w-md text-lg">
            Música, cultura, deporte y tecnología en un solo lugar.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={RUTAS.eventos}
              className="inline-flex min-h-12 items-center justify-center rounded-lg bg-white px-6 font-semibold text-marca-700 hover:bg-marca-50"
            >
              Ver cartelera
            </Link>
            {sesion.estado !== 'autenticado' && (
              <Link
                to={RUTAS.registro}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/80 px-6 font-semibold text-white hover:bg-white/10"
              >
                Crear cuenta
              </Link>
            )}
          </div>
        </div>
      </section>

      <Pagina>
        <section aria-labelledby="proximos" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="proximos" className="text-xl font-bold">
              Próximos eventos
            </h2>
            <VerTodos a={RUTAS.eventos} />
          </div>
          {eventos.isPending && <Cargando forma="tarjetas" filas={3} />}
          {eventos.isError && (
            <EstadoError mensaje={mensajeDeError(eventos.error)} onReintentar={() => void eventos.refetch()} />
          )}
          {eventos.data?.length === 0 && (
            <EstadoVacio
              mensaje="Aún no hay eventos publicados"
              accion={
                <Link to={RUTAS.artistas} className={clasesBoton('secundario')}>
                  Ver artistas
                </Link>
              }
            />
          )}
          {eventos.data && eventos.data.length > 0 && <GrillaEventos eventos={eventos.data.slice(0, 3)} />}
        </section>

        <section aria-labelledby="destacados" className="mt-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="destacados" className="text-xl font-bold">
              Artistas destacados
            </h2>
            <VerTodos a={RUTAS.artistas} />
          </div>
          {artistas.isPending && <Cargando filas={1} />}
          {artistas.isError && (
            <EstadoError mensaje={mensajeDeError(artistas.error)} onReintentar={() => void artistas.refetch()} />
          )}
          {artistas.data?.length === 0 && <EstadoVacio mensaje="Aún no hay artistas activos" />}
          {artistas.data && artistas.data.length > 0 && (
            <ul className="flex flex-wrap gap-3">
              {artistas.data.slice(0, 6).map((a) => (
                <li key={a.id}>
                  <Link
                    to={RUTAS.artista(a.id)}
                    className="flex items-center gap-2 rounded-full pr-4 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Avatar nombre={a.stageName} semilla={a.id} />
                    <span className="text-sm font-semibold">{a.stageName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Pagina>
    </>
  )
}
