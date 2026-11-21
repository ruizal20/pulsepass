import { Link } from 'react-router'
import Badge from '../../../componentes/Badge'
import { Icono } from '../../../componentes/Iconos'
import Tarjeta from '../../../componentes/Tarjeta'
import { RUTAS } from '../../../lib/rutas'
import type { Sede } from '../tipos'

export default function TarjetaSede({ sede }: { sede: Sede }) {
  return (
    <Link to={RUTAS.sede(sede.code)} className="block rounded-xl">
      <Tarjeta className="space-y-1 p-4 transition-shadow hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold">{sede.name}</h3>
          <Badge tono={sede.active ? 'ACTIVA' : 'INACTIVA'}>{sede.active ? 'Activa' : 'Inactiva'}</Badge>
        </div>
        <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <Icono nombre="pin" className="size-4" />
          {sede.city} · Cap. {sede.capacity.toLocaleString('es-CO')}
        </p>
      </Tarjeta>
    </Link>
  )
}
