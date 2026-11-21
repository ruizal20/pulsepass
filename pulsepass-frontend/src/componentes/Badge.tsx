import clsx from 'clsx'

export type TonoBadge =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'SOLD_OUT'
  | 'CANCELLED'
  | 'FINISHED'
  | 'RESERVED'
  | 'PAID'
  | 'USED'
  | 'ACTIVA'
  | 'INACTIVA'
  | 'ROL'

// Mapa tipado (PRD §9.1): sin clases dinámicas.
const TONOS: Record<TonoBadge, string> = {
  DRAFT: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  PUBLISHED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  SOLD_OUT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  FINISHED: 'bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-slate-100',
  RESERVED: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  USED: 'bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-slate-100',
  ACTIVA: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
  INACTIVA: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  ROL: 'bg-marca-50 text-marca-700 dark:bg-indigo-900/50 dark:text-indigo-200',
}

interface Props {
  tono: TonoBadge
  children?: string
  className?: string
}

export default function Badge({ tono, children, className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        TONOS[tono],
        className,
      )}
    >
      {children ?? tono}
    </span>
  )
}
