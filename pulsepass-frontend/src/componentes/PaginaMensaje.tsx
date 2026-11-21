import { Link } from 'react-router'
import type { ReactNode } from 'react'
import { RUTAS } from '../lib/rutas'
import { clasesBoton } from './Boton'
import { Pagina } from './Contenedor'
import Tarjeta from './Tarjeta'

interface Props {
  codigo?: string
  titulo?: string
  mensaje: string
  acciones?: ReactNode
}

export default function PaginaMensaje({ codigo, titulo, mensaje, acciones }: Props) {
  return (
    <Pagina>
      <Tarjeta className="mx-auto max-w-lg space-y-4 p-8 text-center">
        {codigo && <p className="font-titulo text-6xl font-extrabold text-marca-600">{codigo}</p>}
        {titulo && <h1 className="text-2xl font-bold">{titulo}</h1>}
        <p>{mensaje}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {acciones}
          <Link to={RUTAS.inicio} className={clasesBoton(acciones ? 'secundario' : 'primario')}>
            Volver al inicio
          </Link>
        </div>
      </Tarjeta>
    </Pagina>
  )
}
