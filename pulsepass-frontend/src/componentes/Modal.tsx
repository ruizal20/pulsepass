import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Icono } from './Iconos'

interface Props {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
}

const FOCUSABLES =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Diálogo accesible: atrapa el foco, cierra con Esc y devuelve el foco al disparador. */
export default function Modal({ abierto, titulo, onCerrar, children }: Props) {
  const idTitulo = useId()
  const panel = useRef<HTMLDivElement>(null)
  const onCerrarRef = useRef(onCerrar)
  useEffect(() => {
    onCerrarRef.current = onCerrar
  })

  useEffect(() => {
    if (!abierto) return
    const previo = document.activeElement as HTMLElement | null
    const enfocables = () => Array.from(panel.current?.querySelectorAll<HTMLElement>(FOCUSABLES) ?? [])
    // Foco inicial: primer control del cuerpo (no el botón ✕ si hay otro)
    const lista = enfocables()
    ;(lista[1] ?? lista[0])?.focus()

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCerrarRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const items = enfocables()
      const primero = items[0]
      const ultimo = items[items.length - 1]
      if (!primero || !ultimo) return
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    }
    document.addEventListener('keydown', alTeclear)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      previo?.focus()
    }
  }, [abierto])

  if (!abierto) return null
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        className="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 id={idTitulo} className="text-base font-semibold">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="-m-2 inline-flex size-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Icono nombre="cerrar" />
          </button>
        </div>
        <div className="space-y-4 px-5 py-4">{children}</div>
      </div>
    </div>
  )
}
