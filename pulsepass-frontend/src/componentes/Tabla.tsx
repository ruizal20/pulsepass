import type { ReactNode } from 'react'

export interface Columna<T> {
  encabezado: string
  celda: (fila: T) => ReactNode
}

interface Props<T> {
  columnas: Columna<T>[]
  filas: T[]
  clave: (fila: T) => string | number
  /** Vista móvil (< md): cada fila se transforma en tarjeta. */
  tarjeta: (fila: T) => ReactNode
  ariaLabel: string
}

/** Tabla genérica (guía React §10). md: tabla · base: lista de tarjetas (FR-FE… móvil). */
export default function Tabla<T>({ columnas, filas, clave, tarjeta, ariaLabel }: Props<T>) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-sm" aria-label={ariaLabel}>
          <thead className="border-b border-slate-200 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400">
            <tr>
              {columnas.map((c) => (
                <th key={c.encabezado} scope="col" className="px-4 py-3 font-semibold">
                  {c.encabezado}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filas.map((fila) => (
              <tr key={clave(fila)}>
                {columnas.map((c) => (
                  <td key={c.encabezado} className="px-4 py-3">
                    {c.celda(fila)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="space-y-3 md:hidden" aria-label={ariaLabel}>
        {filas.map((fila) => (
          <li key={clave(fila)}>{tarjeta(fila)}</li>
        ))}
      </ul>
    </>
  )
}
