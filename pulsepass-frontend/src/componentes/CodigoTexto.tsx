import clsx from 'clsx'

/** DES-05: los códigos (CMF-2026, TKT-8F2A1C) en fuente monoespaciada. */
export default function CodigoTexto({ children, className }: { children: string; className?: string }) {
  return <span className={clsx('font-mono font-semibold', className)}>{children}</span>
}
