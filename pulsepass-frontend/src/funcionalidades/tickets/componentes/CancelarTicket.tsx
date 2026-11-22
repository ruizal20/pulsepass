import { useState } from 'react'
import Aviso from '../../../componentes/Aviso'
import { useAvisos } from '../../../componentes/Avisos'
import Boton from '../../../componentes/Boton'
import CodigoTexto from '../../../componentes/CodigoTexto'
import Modal from '../../../componentes/Modal'
import { mensajeDeError } from '../../../lib/errores'
import { useCancelarTicket } from '../hooks'
import type { Ticket } from '../tipos'

/**
 * Botón + modal de cancelación. El botón solo aparece si status === 'PAID' (UX);
 * un 409 del backend se muestra dentro del modal sin cerrarlo (FR-FE-TKT-005).
 */
export default function CancelarTicket({ ticket, etiqueta = 'Cancelar' }: { ticket: Ticket; etiqueta?: string }) {
  const [abierto, setAbierto] = useState(false)
  const cancelar = useCancelarTicket()
  const avisos = useAvisos()

  if (ticket.status !== 'PAID') return null

  const cerrar = () => {
    setAbierto(false)
    cancelar.reset()
  }
  const confirmar = () =>
    cancelar.mutate(ticket.ticketCode, {
      onSuccess: () => {
        setAbierto(false)
        avisos.exito('Ticket cancelado.')
      },
    })

  return (
    <>
      <Boton variante="peligro" onClick={() => setAbierto(true)}>
        {etiqueta}
      </Boton>
      <Modal abierto={abierto} titulo="Cancelar ticket" onCerrar={cerrar}>
        <p className="text-sm">
          ¿Quieres cancelar el ticket <CodigoTexto>{ticket.ticketCode}</CodigoTexto> ({ticket.type}) de{' '}
          {ticket.event.title}?
        </p>
        {cancelar.isError && <Aviso tipo="error">{mensajeDeError(cancelar.error)}</Aviso>}
        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={cerrar}>
            Volver
          </Boton>
          <Boton variante="peligro" cargando={cancelar.isPending} onClick={confirmar}>
            Cancelar ticket
          </Boton>
        </div>
      </Modal>
    </>
  )
}
