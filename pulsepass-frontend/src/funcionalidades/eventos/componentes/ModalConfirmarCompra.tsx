import Aviso from '../../../componentes/Aviso'
import Boton from '../../../componentes/Boton'
import Modal from '../../../componentes/Modal'
import { mensajeDeError } from '../../../lib/errores'
import type { TicketType } from '../../tickets/tipos'
import type { Evento } from '../tipos'

interface Props {
  abierto: boolean
  evento: Evento
  tipo: TicketType
  email: string
  cargando: boolean
  error: unknown
  onConfirmar: () => void
  onCerrar: () => void
}

/** DES-10: el error 409 se muestra DENTRO del modal (role="alert") sin cerrarlo. */
export default function ModalConfirmarCompra({
  abierto,
  evento,
  tipo,
  email,
  cargando,
  error,
  onConfirmar,
  onCerrar,
}: Props) {
  const filas: [string, string][] = [
    ['Evento', evento.title],
    ['Tipo', tipo],
    ['Cuenta', email],
  ]
  return (
    <Modal abierto={abierto} titulo="Confirmar compra" onCerrar={onCerrar}>
      <dl className="text-sm">
        {filas.map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between gap-4 border-b border-slate-100 py-2 dark:border-slate-800"
          >
            <dt className="text-slate-600 dark:text-slate-400">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      {error !== null && error !== undefined && <Aviso tipo="error">{mensajeDeError(error)}</Aviso>}
      <div className="flex justify-end gap-2">
        <Boton variante="secundario" onClick={onCerrar}>
          Cancelar
        </Boton>
        <Boton cargando={cargando} onClick={onConfirmar}>
          Confirmar
        </Boton>
      </div>
    </Modal>
  )
}
