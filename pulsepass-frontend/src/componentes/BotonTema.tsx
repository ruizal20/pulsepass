import { useState } from 'react'
import { Icono } from './Iconos'

/** FR-FE-GEN-004: respeta prefers-color-scheme (ver index.html) y permite alternar. */
export default function BotonTema() {
  const [oscuro, setOscuro] = useState(() => document.documentElement.classList.contains('dark'))

  const alternar = () => {
    const siguiente = !oscuro
    document.documentElement.classList.toggle('dark', siguiente)
    try {
      localStorage.setItem('pulsepass-tema', siguiente ? 'oscuro' : 'claro')
    } catch {
      /* preferencia no persistida */
    }
    setOscuro(siguiente)
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={oscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="inline-flex size-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      <Icono nombre={oscuro ? 'sol' : 'luna'} />
    </button>
  )
}
