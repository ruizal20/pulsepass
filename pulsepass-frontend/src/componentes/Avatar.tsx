import clsx from 'clsx'
import { iniciales } from '../lib/formato'

const PALETA = [
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200',
  'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
  'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
  'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200',
  'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
] as const

const TAMANOS = {
  sm: 'size-7 text-[10px]',
  md: 'size-10 text-sm',
  lg: 'size-24 text-2xl',
} as const

interface Props {
  nombre: string
  /** Índice estable para elegir el color (p. ej. el id). */
  semilla?: number
  tamano?: keyof typeof TAMANOS
}

export default function Avatar({ nombre, semilla = 0, tamano = 'md' }: Props) {
  const color = PALETA[Math.abs(semilla) % PALETA.length]
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold',
        TAMANOS[tamano],
        color,
      )}
    >
      {iniciales(nombre)}
    </span>
  )
}
