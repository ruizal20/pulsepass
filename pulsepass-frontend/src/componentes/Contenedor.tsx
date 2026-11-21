import type { ReactNode } from 'react'

/** DES-04: columna estrecha (≈ 830 px) para formularios y páginas de gestión. */
export function ContenedorEstrecho({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl">{children}</div>
}

/** Contenedor estándar de página: max-w-6xl, px-4, py-8. */
export function Pagina({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 py-8">{children}</div>
}
