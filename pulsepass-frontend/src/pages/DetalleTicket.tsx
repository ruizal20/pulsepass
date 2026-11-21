import { useState } from 'react'
import { Link, useParams } from 'react-router'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import CodigoTexto from '../componentes/CodigoTexto'
import { ContenedorEstrecho, Pagina } from '../componentes/Contenedor'
import { Cargando, ErrorConsulta } from '../componentes/Estados'
import { Icono } from '../componentes/Iconos'
import PrecioCOP from '../componentes/PrecioCOP'
import Tarjeta from '../componentes/Tarjeta'
import { useEmailSesion } from '../funcionalidades/auth/hooks'
import CancelarTicket from '../funcionalidades/tickets/componentes/CancelarTicket'
import { useTicket } from '../funcionalidades/tickets/hooks'
import { useUsuarioPorEmail } from '../funcionalidades/usuarios/hooks'
import { formatearFechaHoraCorta } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

export default function DetalleTicket() {
  const { ticketCode } = useParams()
  const { data: ticket, isPending, error, refetch } = useTicket(ticketCode)
  const email = useEmailSesion()
  const usuario = useUsuarioPorEmail(email)
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    if (!ticket) return
    try {
      await navigator.clipboard.writeText(ticket.ticketCode)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* portapapeles no disponible: el código sigue visible como texto */
    }
  }

  const titular = usuario.data?.profile
    ? `${usuario.data.profile.firstName} ${usuario.data.profile.lastName}`
    : undefined

  return (
    <Pagina>
      <ContenedorEstrecho>
        <Link to={RUTAS.misTickets} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-marca-600 hover:underline dark:text-marca-500">
          <Icono nombre="atras" className="size-4" /> Mis tickets
        </Link>
        {isPending && <Cargando forma="detalle" />}
        {error && (
          // 403/404 (ajeno o inexistente) → misma pantalla, sin revelar existencia
          <ErrorConsulta error={error} onReintentar={() => void refetch()} mensajeNoDisponible="Ticket no disponible" />
        )}
        {ticket && (
          <div className="space-y-4">
            <Tarjeta className="space-y-3 p-6">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-2xl font-extrabold">{ticket.event.title}</h1>
                <Badge tono={ticket.status} />
              </div>
              <dl className="text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 dark:border-slate-800">
                  <dt className="text-slate-600 dark:text-slate-400">Código</dt>
                  <dd className="flex items-center gap-2">
                    <CodigoTexto>{ticket.ticketCode}</CodigoTexto>
                    <Boton variante="secundario" className="min-h-9 px-3" onClick={() => void copiar()}>
                      <Icono nombre="copiar" className="size-4" />
                      {copiado ? 'Copiado' : 'Copiar'}
                    </Boton>
                  </dd>
                </div>
                {(
                  [
                    ['Tipo', ticket.type],
                    ['Precio', <PrecioCOP key="p" valor={ticket.price} />],
                    ['Comprado el', formatearFechaHoraCorta(ticket.purchaseDate)],
                    ...(titular ? [['Titular', titular] as const] : []),
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-slate-100 py-2 dark:border-slate-800">
                    <dt className="text-slate-600 dark:text-slate-400">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-sm text-slate-600 dark:text-slate-400">Presenta este código en el ingreso.</p>
            </Tarjeta>
            <div className="flex justify-end">
              <CancelarTicket ticket={ticket} etiqueta="Cancelar ticket" />
            </div>
          </div>
        )}
      </ContenedorEstrecho>
    </Pagina>
  )
}
