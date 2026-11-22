import { Link, useParams } from 'react-router'
import Avatar from '../componentes/Avatar'
import Badge from '../componentes/Badge'
import { clasesBoton } from '../componentes/Boton'
import { Pagina } from '../componentes/Contenedor'
import { Cargando, ErrorConsulta } from '../componentes/Estados'
import { Icono } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { ESTILO_CATEGORIA } from '../funcionalidades/eventos/categorias'
import PanelCategoria from '../funcionalidades/eventos/componentes/PanelCategoria'
import PanelCompra from '../funcionalidades/eventos/componentes/PanelCompra'
import { useEvento } from '../funcionalidades/eventos/hooks'
import { formatearFechaHora } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

export default function DetalleEvento() {
  const { eventCode } = useParams()
  const { data: evento, isPending, error, refetch } = useEvento(eventCode)

  const volver = (
    <Link to={RUTAS.eventos} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-marca-600 hover:underline dark:text-marca-500">
      <Icono nombre="atras" className="size-4" /> Volver a la cartelera
    </Link>
  )

  return (
    <Pagina>
      {volver}
      {isPending && <Cargando forma="detalle" />}
      {error && (
        // AC-FE-003 / GAP-02: 404 y 403 se presentan igual, sin datos del borrador.
        <ErrorConsulta
          error={error}
          onReintentar={() => void refetch()}
          mensajeNoDisponible="Evento no disponible"
          accionVolver={
            <Link to={RUTAS.eventos} className={clasesBoton('secundario')}>
              Ver cartelera
            </Link>
          }
        />
      )}
      {evento && (
        <div className="grid gap-6 pb-24 lg:grid-cols-[1fr_20rem] lg:pb-0">
          <Tarjeta className="overflow-hidden">
            <PanelCategoria categoria={evento.category} className="h-40 md:h-56" />
            <div className="space-y-4 p-5 md:p-6">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold tracking-wide ${ESTILO_CATEGORIA[evento.category].texto}`}>
                  {evento.category}
                </span>
                <Badge tono={evento.status} />
              </div>
              <h1 className="text-3xl font-extrabold">{evento.title}</h1>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Icono nombre="calendario" className="size-4" />
                  {formatearFechaHora(evento.eventDate)}
                </span>
                {evento.minimumAge != null && (
                  <span className="flex items-center gap-1.5">
                    <Icono nombre="usuario" className="size-4" />
                    Edad mínima: {evento.minimumAge}
                  </span>
                )}
              </p>
              {evento.description && <p className="whitespace-pre-line">{evento.description}</p>}

              {evento.artists.length > 0 && (
                <section aria-labelledby="artistas-evento" className="space-y-2">
                  <h2 id="artistas-evento" className="text-base font-bold">
                    Artistas
                  </h2>
                  <ul className="flex flex-wrap gap-3">
                    {evento.artists.map((a) => (
                      <li key={a.id}>
                        <Link
                          to={RUTAS.artista(a.id)}
                          className="flex items-center gap-2 rounded-full pr-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Avatar nombre={a.stageName} semilla={a.id} tamano="sm" />
                          {a.stageName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {evento.venue && (
                <section aria-labelledby="sede-evento" className="space-y-2">
                  <h2 id="sede-evento" className="text-base font-bold">
                    Sede
                  </h2>
                  <Link to={RUTAS.sede(evento.venue.code)} className="block">
                    <Tarjeta className="flex items-center gap-3 p-3 hover:shadow-md">
                      <Icono nombre="sede" className="size-6 text-marca-600" />
                      <div className="text-sm">
                        <p className="font-semibold">{evento.venue.name}</p>
                        <p className="text-slate-600 dark:text-slate-400">
                          {evento.venue.city} · Capacidad {evento.venue.capacity.toLocaleString('es-CO')}
                        </p>
                      </div>
                    </Tarjeta>
                  </Link>
                </section>
              )}
            </div>
          </Tarjeta>
          <div className="lg:sticky lg:top-20 lg:self-start">
            <PanelCompra evento={evento} />
          </div>
        </div>
      )}
    </Pagina>
  )
}
