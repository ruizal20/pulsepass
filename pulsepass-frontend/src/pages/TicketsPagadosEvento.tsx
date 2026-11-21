import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useAvisos } from '../componentes/Avisos'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import CodigoTexto from '../componentes/CodigoTexto'
import { Campo } from '../componentes/Campo'
import { Pagina } from '../componentes/Contenedor'
import { Cargando, ErrorConsulta, EstadoVacio } from '../componentes/Estados'
import PrecioCOP from '../componentes/PrecioCOP'
import Tabla, { type Columna } from '../componentes/Tabla'
import Tarjeta from '../componentes/Tarjeta'
import { useTicketsPagadosPorEvento, useUsarTicket } from '../funcionalidades/tickets/hooks'
import type { Ticket } from '../funcionalidades/tickets/tipos'
import { mensajeDeError } from '../lib/errores'
import { formatearFecha } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

export default function TicketsPagadosEvento() {
  const { eventCode } = useParams()
  const navigate = useNavigate()
  const avisos = useAvisos()
  const [entrada, setEntrada] = useState(eventCode ?? '')
  const consulta = useTicketsPagadosPorEvento(eventCode)
  const usar = useUsarTicket()

  const ir = (e: FormEvent) => {
    e.preventDefault()
    const codigo = entrada.trim()
    if (codigo) void navigate(RUTAS.ticketsPagados(codigo))
  }

  const marcar = (t: Ticket) =>
    usar.mutate(t.ticketCode, {
      onSuccess: () => avisos.exito(`Ingreso registrado: ${t.ticketCode}`),
      onError: (error) => avisos.error(mensajeDeError(error)),
    })

  const enProceso = (t: Ticket) => usar.isPending && usar.variables === t.ticketCode
  const botonUsar = (t: Ticket, className?: string) => (
    <Boton className={className ?? 'min-h-9 px-4'} cargando={enProceso(t)} onClick={() => marcar(t)}>
      Usar
    </Boton>
  )

  // El DTO de ticket no incluye al titular: se muestran evento/fecha de compra.
  const columnas: Columna<Ticket>[] = [
    { encabezado: 'Código', celda: (t) => <CodigoTexto className="text-xs">{t.ticketCode}</CodigoTexto> },
    { encabezado: 'Tipo', celda: (t) => t.type },
    { encabezado: 'Precio', celda: (t) => <PrecioCOP valor={t.price} /> },
    { encabezado: 'Compra', celda: (t) => formatearFecha(t.purchaseDate) },
    { encabezado: 'Estado', celda: (t) => <Badge tono={t.status} /> },
    { encabezado: 'Acción', celda: (t) => botonUsar(t) },
  ]

  return (
    <Pagina>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-extrabold">
          Tickets pagados{eventCode && <> · <CodigoTexto>{eventCode}</CodigoTexto></>}
        </h1>
        <form onSubmit={ir} className="flex items-end gap-2" role="search" aria-label="Buscar evento">
          <Campo
            etiqueta="Evento"
            autoComplete="off"
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
            className="w-40"
          />
          <Boton type="submit" variante="secundario" className="mb-0">
            Ir
          </Boton>
        </form>
      </div>

      {!eventCode && (
        <EstadoVacio icono="ticket" mensaje="Ingresa el código de un evento para ver sus tickets pagados" />
      )}
      {eventCode && consulta.isPending && <Cargando filas={3} />}
      {consulta.isError && (
        <ErrorConsulta
          error={consulta.error}
          onReintentar={() => void consulta.refetch()}
          mensajeNoDisponible="Evento no encontrado"
        />
      )}
      {consulta.data?.length === 0 && <EstadoVacio icono="ticket" mensaje="No hay tickets pagados" />}
      {consulta.data && consulta.data.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total: {consulta.data.length}</p>
          <Tabla
            ariaLabel="Tickets pagados"
            columnas={columnas}
            filas={consulta.data}
            clave={(t) => t.ticketCode}
            tarjeta={(t) => (
              <Tarjeta className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <CodigoTexto>{t.ticketCode}</CodigoTexto>
                  <Badge tono={t.status} />
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t.type} · <PrecioCOP valor={t.price} />
                </p>
                {botonUsar(t, 'w-full')}
              </Tarjeta>
            )}
          />
        </div>
      )}
      {eventCode && (
        <p className="mt-6 text-sm">
          <Link to={RUTAS.validacion} className="font-semibold text-marca-600 hover:underline dark:text-marca-500">
            Ir a validación por código →
          </Link>
        </p>
      )}
    </Pagina>
  )
}
