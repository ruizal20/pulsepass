import clsx from 'clsx'

interface Opcion<T extends string> {
  valor: T
  etiqueta: string
}

interface Props<T extends string> {
  opciones: readonly Opcion<T>[]
  valor: T
  onCambio: (valor: T) => void
  ariaLabel: string
}

/** DES-06: chips con aria-pressed. */
export default function FiltroChips<T extends string>({ opciones, valor, onCambio, ariaLabel }: Props<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {opciones.map((o) => {
        const activo = o.valor === valor
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={activo}
            onClick={() => onCambio(o.valor)}
            className={clsx(
              'min-h-11 rounded-full border px-4 text-sm font-semibold transition-colors',
              activo
                ? 'border-marca-600 bg-marca-600 text-white'
                : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
            )}
          >
            {o.etiqueta}
          </button>
        )
      })}
    </div>
  )
}
