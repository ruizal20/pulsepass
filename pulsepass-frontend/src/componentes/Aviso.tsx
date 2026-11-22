import type { ReactNode } from 'react'
import clsx from 'clsx'
import { Icono, type NombreIcono } from './Iconos'

export type TipoAviso = 'exito' | 'error' | 'info' | 'advertencia'

const ESTILOS: Record<TipoAviso, string> = {
  exito:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
  info: 'border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-200',
  advertencia:
    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
}

const ICONOS: Record<TipoAviso, NombreIcono> = {
  exito: 'check',
  error: 'advertencia',
  info: 'rayo',
  advertencia: 'advertencia',
}

interface Props {
  tipo: TipoAviso
  children: ReactNode
  onCerrar?: () => void
  className?: string
}

/** DES-10: errores con role="alert"; éxito/info con role="status" (aria-live polite). */
export default function Aviso({ tipo, children, onCerrar, className }: Props) {
  const urgente = tipo === 'error' || tipo === 'advertencia'
  return (
    <div
      role={urgente ? 'alert' : 'status'}
      className={clsx(
        'flex items-start gap-2 rounded-lg border px-3 py-2 text-sm',
        ESTILOS[tipo],
        className,
      )}
    >
      <Icono nombre={ICONOS[tipo]} className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1 font-medium">{children}</div>
      {onCerrar && (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
          className="-m-1 rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Icono nombre="cerrar" className="size-4" />
        </button>
      )}
    </div>
  )
}
