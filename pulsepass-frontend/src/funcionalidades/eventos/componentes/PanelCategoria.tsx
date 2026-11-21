import clsx from 'clsx'
import { Icono } from '../../../componentes/Iconos'
import { ESTILO_CATEGORIA } from '../categorias'
import type { EventCategory } from '../tipos'

export default function PanelCategoria({
  categoria,
  className,
}: {
  categoria: EventCategory
  className?: string
}) {
  const e = ESTILO_CATEGORIA[categoria]
  return (
    <div className={clsx('flex items-center justify-center', e.fondo, e.texto, className)}>
      <Icono nombre={e.icono} className="size-10" />
    </div>
  )
}
