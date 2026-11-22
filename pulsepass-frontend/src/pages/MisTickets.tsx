import { useState } from 'react'
import { Link } from 'react-router'
import { clasesBoton } from '../componentes/Boton'
import { Pagina } from '../componentes/Contenedor'
import { Cargando, EstadoError, EstadoVacio } from '../componentes/Estados'
import FiltroChips from '../componentes/FiltroChips'
import TarjetaTicket from '../funcionalidades/tickets/componentes/TarjetaTicket'
import { useMisTickets } from '../funcionalidades/tickets/hooks'
import type { TicketStatus } from '../funcionalidades/tickets/tipos'
import { mensajeDeError } from '../lib/errores'
import { RUTAS } from '../lib/rutas'

type Filtro = 'TODOS' | Extract<TicketStatus, 'PAID' | 'USED' | 'CANCELLED'>

const FILTROS = [
  { valor: 'TODOS', etiqueta: 'Todos' },
  { valor: 'PAID', etiqueta: 'Pagados' },
  { valor: 'USED', etiqueta: 'Usados' },
  { valor: 'CANCELLED', etiqueta: 'Cancelados' },
] as const satisfies readonly { valor: Filtro; etiqueta: string }[]

export default function MisTickets() {
  const [filtro, setFiltro] = useState<Filtro>('TODOS')
  const { data, isPending, isError, error, refetch } = useMisTickets()

  const tickets = (data ?? [])
    .filter((t) => filtro === 'TODOS' || t.status === filtro)
    .toSorted((a, b) => b.purchaseDate.localeCompare(a.purchaseDate))

  return (
    <Pagina>
      <h1 className="mb-4 text-3xl font-extrabold">Mis tickets</h1>
      <FiltroChips ariaLabel="Filtrar por estado" opciones={FILTROS} valor={filtro} onCambio={setFiltro} />
      <div className="mt-6 space-y-4">
        {isPending && <Cargando filas={3} />}
        {isError && <EstadoError mensaje={mensajeDeError(error)} onReintentar={() => void refetch()} />}
        {data?.length === 0 && (
          <EstadoVacio
            icono="ticket"
            mensaje="Aún no tienes tickets"
            accion={
              <Link to={RUTAS.eventos} className={clasesBoton('primario')}>
                Ver cartelera
              </Link>
            }
          />
        )}
        {data && data.length > 0 && tickets.length === 0 && (
          <EstadoVacio mensaje="No tienes tickets con este estado" />
        )}
        {tickets.map((t) => (
          <TarjetaTicket key={t.ticketCode} ticket={t} />
        ))}
      </div>
    </Pagina>
  )
}
