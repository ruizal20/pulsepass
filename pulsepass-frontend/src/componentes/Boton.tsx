import type { ComponentProps } from 'react'
import clsx from 'clsx'

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma'

// FE-008: clases completas, nunca construidas dinámicamente.
const VARIANTES: Record<VarianteBoton, string> = {
  primario: 'bg-marca-600 text-white hover:bg-marca-700 disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700 dark:disabled:text-slate-400',
  secundario:
    'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 disabled:opacity-50',
  peligro: 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50',
  fantasma:
    'text-marca-600 hover:bg-marca-50 dark:text-marca-500 dark:hover:bg-slate-800 disabled:opacity-50',
}

const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed'

/** Para aplicar el mismo aspecto a <Link>. */
export function clasesBoton(variante: VarianteBoton = 'primario', className?: string): string {
  return clsx(BASE, VARIANTES[variante], className)
}

interface Props extends ComponentProps<'button'> {
  variante?: VarianteBoton
  cargando?: boolean
}

export default function Boton({
  variante = 'primario',
  cargando = false,
  disabled,
  className,
  children,
  type = 'button',
  ...resto
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
      className={clasesBoton(variante, className)}
      {...resto}
    >
      {cargando ? 'Cargando…' : children}
    </button>
  )
}
