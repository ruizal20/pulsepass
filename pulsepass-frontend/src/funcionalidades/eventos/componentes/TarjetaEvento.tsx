import { Link } from 'react-router'
import Badge from '../../../componentes/Badge'
import { Icono } from '../../../componentes/Iconos'
import Tarjeta from '../../../componentes/Tarjeta'
import { formatearFecha } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import { ESTILO_CATEGORIA } from '../categorias'
import type { Evento } from '../tipos'
import PanelCategoria from './PanelCategoria'

/** La tarjeta completa es un Link a /eventos/:eventCode. */
export default function TarjetaEvento({ evento }: { evento: Evento }) {
  const estilo = ESTILO_CATEGORIA[evento.category]
  return (
    <Link
      to={RUTAS.evento(evento.eventCode)}
      className="group block rounded-xl focus-visible:outline-2"
    >
      <Tarjeta className="h-full overflow-hidden transition-shadow group-hover:shadow-md">
        <PanelCategoria categoria={evento.category} className="h-32" />
        <div className="space-y-1.5 p-4">
          <p className={`text-xs font-bold tracking-wide ${estilo.texto}`}>{evento.category}</p>
          <h3 className="text-base leading-snug font-semibold">{evento.title}</h3>
          <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            <Icono nombre="calendario" className="size-4" />
            {formatearFecha(evento.eventDate)}
          </p>
          {evento.venue && (
            <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
              <Icono nombre="pin" className="size-4" />
              {evento.venue.city}
            </p>
          )}
          <div className="pt-1">
            <Badge tono={evento.status} />
          </div>
        </div>
      </Tarjeta>
    </Link>
  )
}
