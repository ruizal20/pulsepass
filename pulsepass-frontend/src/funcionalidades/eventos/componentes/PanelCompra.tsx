import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import clsx from 'clsx'
import Boton, { clasesBoton } from '../../../componentes/Boton'
import Tarjeta from '../../../componentes/Tarjeta'
import { RUTAS } from '../../../lib/rutas'
import { useAuth } from '../../auth/hooks'
import { useComprarTicket } from '../../tickets/hooks'
import { TIPOS_TICKET, type TicketType } from '../../tickets/tipos'
import type { Evento } from '../tipos'
import ModalConfirmarCompra from './ModalConfirmarCompra'

/** Motivo visible cuando el evento no admite compra (el backend sigue siendo la autoridad). */
const MOTIVO_NO_COMPRA: Record<string, string> = {
  DRAFT: 'El evento aún no está publicado.',
  SOLD_OUT: 'Entradas agotadas.',
  CANCELLED: 'El evento fue cancelado.',
  FINISHED: 'El evento ya finalizó.',
}

export default function PanelCompra({ evento }: { evento: Evento }) {
  const { sesion, tieneRol } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [tipo, setTipo] = useState<TicketType>('GENERAL')
  const [modal, setModal] = useState(false)
  const compra = useComprarTicket()

  // STAFF/ADMIN no compran desde la UI: panel oculto.
  if (sesion.estado === 'autenticado' && !tieneRol('USER')) return null

  const desde = location.pathname + location.search
  const habilitado = evento.status === 'PUBLISHED'
  const motivo = MOTIVO_NO_COMPRA[evento.status]

  const cerrarModal = () => {
    setModal(false)
    compra.reset()
  }

  const confirmar = () =>
    compra.mutate(
      { eventCode: evento.eventCode, type: tipo },
      { onSuccess: (t) => void navigate(RUTAS.confirmacion(t.ticketCode)) },
    )

  const boton = (extra?: string) =>
    sesion.estado === 'anonimo' ? (
      <Link to={RUTAS.login} state={{ desde }} className={clasesBoton('primario', clsx('w-full', extra))}>
        Inicia sesión para comprar
      </Link>
    ) : (
      <Boton
        className={clsx('w-full', extra)}
        disabled={!habilitado || sesion.estado !== 'autenticado'}
        onClick={() => setModal(true)}
      >
        Comprar entrada
      </Boton>
    )

  return (
    <>
      <Tarjeta className="space-y-4 p-5">
        <fieldset className="space-y-2">
          <legend className="font-titulo text-lg font-semibold">Entradas</legend>
          <p className="text-sm text-slate-600 dark:text-slate-400">Tipo de entrada</p>
          {TIPOS_TICKET.map((t) => (
            <label
              key={t}
              className={clsx(
                'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm font-medium',
                tipo === t
                  ? 'border-marca-500 bg-marca-50 dark:bg-indigo-950'
                  : 'border-slate-300 dark:border-slate-600',
              )}
            >
              <input
                type="radio"
                name="tipo-entrada"
                value={t}
                checked={tipo === t}
                onChange={() => setTipo(t)}
                className="accent-marca-600"
              />
              {t}
            </label>
          ))}
        </fieldset>
        {boton()}
        {!habilitado && motivo && (
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{motivo}</p>
        )}
        <p className="text-xs text-slate-600 dark:text-slate-400">
          El precio lo define el sistema al confirmar.
        </p>
      </Tarjeta>

      {/* DES-07: barra de compra fija solo en móvil */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white p-3 md:hidden dark:border-slate-800 dark:bg-slate-950">
        {boton()}
      </div>

      {sesion.estado === 'autenticado' && (
        <ModalConfirmarCompra
          abierto={modal}
          evento={evento}
          tipo={tipo}
          email={sesion.usuario.email}
          cargando={compra.isPending}
          error={compra.error}
          onConfirmar={confirmar}
          onCerrar={cerrarModal}
        />
      )}
    </>
  )
}
