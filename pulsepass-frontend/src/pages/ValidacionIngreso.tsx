import { useRef, useState, type FormEvent } from 'react'
import Aviso from '../componentes/Aviso'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { ContenedorEstrecho, Pagina } from '../componentes/Contenedor'
import { Cargando } from '../componentes/Estados'
import Tarjeta from '../componentes/Tarjeta'
import { Icono } from '../componentes/Iconos'
import { useBuscarTicket, useUsarTicket } from '../funcionalidades/tickets/hooks'
import { CodigoTicketSchema } from '../funcionalidades/tickets/tipos'
import { esApiError, mensajeDeError } from '../lib/errores'

export default function ValidacionIngreso() {
  const [entrada, setEntrada] = useState('')
  const [codigo, setCodigo] = useState('')
  const [errorCampo, setErrorCampo] = useState<string>()
  const [registrado, setRegistrado] = useState(false)
  const campo = useRef<HTMLInputElement>(null)

  const busqueda = useBuscarTicket(codigo || undefined)
  const usar = useUsarTicket()

  const buscar = (e: FormEvent) => {
    e.preventDefault()
    const r = CodigoTicketSchema.safeParse(entrada)
    if (!r.success) {
      setErrorCampo(r.error.issues[0]?.message)
      return
    }
    setErrorCampo(undefined)
    setRegistrado(false)
    usar.reset()
    if (r.data === codigo) void busqueda.refetch()
    else setCodigo(r.data)
  }

  const marcar = () =>
    usar.mutate(codigo, {
      onSuccess: () => {
        setRegistrado(true)
        setEntrada('') // tras éxito el campo se limpia
        campo.current?.focus()
      },
    })

  const ticket = busqueda.data
  const errorBusqueda = busqueda.error
  const mensajeBusqueda = esApiError(errorBusqueda, 404)
    ? 'Ticket no encontrado.'
    : esApiError(errorBusqueda, 403)
      ? 'Sin permisos.'
      : errorBusqueda
        ? mensajeDeError(errorBusqueda)
        : null

  return (
    <Pagina>
      <ContenedorEstrecho>
        <h1 className="mb-6 text-3xl font-extrabold">Validación de ingreso</h1>
        <form onSubmit={buscar} className="flex items-end gap-3" noValidate>
          <Campo
            ref={campo}
            contenedorClassName="flex-1"
            etiqueta="Código de ticket"
            autoFocus
            autoComplete="off"
            value={entrada}
            error={errorCampo}
            onChange={(e) => setEntrada(e.target.value)}
          />
          <Boton type="submit" className="mb-0 self-start sm:mt-7">
            <Icono nombre="buscar" className="size-4" /> Buscar
          </Boton>
        </form>

        <div className="mt-6 space-y-4" aria-live="polite">
          {codigo && busqueda.isFetching && !ticket && <Cargando filas={1} />}
          {mensajeBusqueda && <Aviso tipo="error">{mensajeBusqueda}</Aviso>}
          {ticket && (
            <Tarjeta className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold">{ticket.event.title}</h2>
                <Badge tono={ticket.status} />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {ticket.type} · Código {ticket.ticketCode}
              </p>
              {ticket.status === 'PAID' && (
                <Boton className="min-h-14 w-full text-base" cargando={usar.isPending} onClick={marcar}>
                  Marcar como usado
                </Boton>
              )}
              {ticket.status === 'USED' && !registrado && !usar.isError && (
                <Aviso tipo="advertencia">Este ticket ya figura como usado.</Aviso>
              )}
              {ticket.status === 'CANCELLED' && <Aviso tipo="advertencia">Este ticket fue cancelado.</Aviso>}
            </Tarjeta>
          )}
          {registrado && (
            <Aviso tipo="exito" className="text-base">
              Ingreso registrado.
            </Aviso>
          )}
          {usar.isError && (
            <Aviso tipo={esApiError(usar.error, 409) ? 'advertencia' : 'error'} className="text-base">
              {esApiError(usar.error, 403) ? 'Sin permisos.' : mensajeDeError(usar.error)}
            </Aviso>
          )}
        </div>
      </ContenedorEstrecho>
    </Pagina>
  )
}
