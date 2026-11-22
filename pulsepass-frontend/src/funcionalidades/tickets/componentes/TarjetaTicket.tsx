import { Link } from 'react-router'
import Badge from '../../../componentes/Badge'
import { clasesBoton } from '../../../componentes/Boton'
import CodigoTexto from '../../../componentes/CodigoTexto'
import PrecioCOP from '../../../componentes/PrecioCOP'
import Tarjeta from '../../../componentes/Tarjeta'
import { formatearFecha } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import type { Ticket } from '../tipos'
import CancelarTicket from './CancelarTicket'

export default function TarjetaTicket({ ticket }: { ticket: Ticket }) {
  return (
    <Tarjeta className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{ticket.event.title}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <CodigoTexto className="text-xs">{ticket.ticketCode}</CodigoTexto> · {ticket.type} ·{' '}
            <PrecioCOP valor={ticket.price} /> · {formatearFecha(ticket.purchaseDate)}
          </p>
        </div>
        <Badge tono={ticket.status} />
      </div>
      <div className="flex flex-wrap justify-end gap-2">
        <Link to={RUTAS.ticket(ticket.ticketCode)} className={clasesBoton('secundario')}>
          Ver detalle
        </Link>
        <CancelarTicket ticket={ticket} />
      </div>
    </Tarjeta>
  )
}
