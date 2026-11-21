import { Link, useParams } from 'react-router'
import Badge from '../componentes/Badge'
import { clasesBoton } from '../componentes/Boton'
import CodigoTexto from '../componentes/CodigoTexto'
import { ContenedorEstrecho, Pagina } from '../componentes/Contenedor'
import { Cargando, ErrorConsulta } from '../componentes/Estados'
import { Icono } from '../componentes/Iconos'
import PrecioCOP from '../componentes/PrecioCOP'
import Tarjeta from '../componentes/Tarjeta'
import { useTicket } from '../funcionalidades/tickets/hooks'
import { RUTAS } from '../lib/rutas'

export default function ConfirmacionCompra() {
  const { ticketCode } = useParams()
  const { data: ticket, isPending, error, refetch } = useTicket(ticketCode)

  return (
    <Pagina>
      <ContenedorEstrecho>
        {isPending && <Cargando forma="detalle" />}
        {error && (
          <ErrorConsulta error={error} onReintentar={() => void refetch()} mensajeNoDisponible="Ticket no disponible" />
        )}
        {ticket && (
          <Tarjeta className="mx-auto max-w-md space-y-3 p-8 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <Icono nombre="check" className="size-7" />
            </span>
            <h1 className="text-2xl font-extrabold">¡Compra realizada con éxito!</h1>
            <p className="font-semibold">{ticket.event.title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Ticket <CodigoTexto className="text-xs">{ticket.ticketCode}</CodigoTexto> · {ticket.type} ·{' '}
              <PrecioCOP valor={ticket.price} />
            </p>
            <Badge tono={ticket.status} />
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link to={RUTAS.misTickets} className={clasesBoton('primario')}>
                Ver mis tickets
              </Link>
              <Link to={RUTAS.eventos} className={clasesBoton('secundario')}>
                Seguir explorando
              </Link>
            </div>
          </Tarjeta>
        )}
      </ContenedorEstrecho>
    </Pagina>
  )
}
