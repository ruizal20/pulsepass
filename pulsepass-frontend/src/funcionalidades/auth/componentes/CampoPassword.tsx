import { useState, type ComponentProps } from 'react'
import { Campo } from '../../../componentes/Campo'
import { Icono } from '../../../componentes/Iconos'

type Props = Omit<ComponentProps<typeof Campo>, 'type' | 'derecha'>

/** Campo de contraseña con botón mostrar/ocultar (accesible). */
export default function CampoPassword(props: Props) {
  const [visible, setVisible] = useState(false)
  return (
    <Campo
      {...props}
      type={visible ? 'text' : 'password'}
      derecha={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          className="inline-flex size-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Icono nombre={visible ? 'ojoTachado' : 'ojo'} className="size-4" />
        </button>
      }
    />
  )
}
