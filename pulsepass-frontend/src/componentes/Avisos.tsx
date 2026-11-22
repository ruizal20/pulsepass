import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import Aviso, { type TipoAviso } from './Aviso'

interface Item {
  id: number
  tipo: TipoAviso
  mensaje: string
}

interface AvisosValor {
  exito: (mensaje: string) => void
  error: (mensaje: string) => void
  info: (mensaje: string) => void
}

const AvisosContext = createContext<AvisosValor | null>(null)

/** FR-FE-GEN-003: toasts de mutaciones. Éxito desaparece a los 4 s; error persiste hasta cerrarse. */
export function AvisosProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([])
  const contador = useRef(0)

  const quitar = useCallback((id: number) => setItems((s) => s.filter((i) => i.id !== id)), [])

  const agregar = useCallback(
    (tipo: TipoAviso, mensaje: string) => {
      const id = ++contador.current
      setItems((s) => [...s, { id, tipo, mensaje }])
      if (tipo !== 'error') setTimeout(() => quitar(id), 4000)
    },
    [quitar],
  )

  const valor = useMemo<AvisosValor>(
    () => ({
      exito: (m) => agregar('exito', m),
      error: (m) => agregar('error', m),
      info: (m) => agregar('info', m),
    }),
    [agregar],
  )

  return (
    <AvisosContext.Provider value={valor}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-20 z-50 flex flex-col items-end gap-2 md:bottom-4"
      >
        {items.map((i) => (
          <div key={i.id} className="pointer-events-auto w-full max-w-sm shadow-lg">
            <Aviso tipo={i.tipo} onCerrar={() => quitar(i.id)}>
              {i.mensaje}
            </Aviso>
          </div>
        ))}
      </div>
    </AvisosContext.Provider>
  )
}

export function useAvisos(): AvisosValor {
  const ctx = useContext(AvisosContext)
  if (!ctx) throw new Error('useAvisos debe usarse dentro de <AvisosProvider>')
  return ctx
}
