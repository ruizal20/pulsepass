import type { Evento } from '../tipos'
import TarjetaEvento from './TarjetaEvento'

export default function GrillaEventos({ eventos }: { eventos: Evento[] }) {
  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {eventos.map((e) => (
        <li key={e.eventCode}>
          <TarjetaEvento evento={e} />
        </li>
      ))}
    </ul>
  )
}
