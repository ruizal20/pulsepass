import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Badge from '../componentes/Badge'
import Boton, { clasesBoton } from '../componentes/Boton'
import CodigoTexto from '../componentes/CodigoTexto'
import { Campo } from '../componentes/Campo'
import { ContenedorEstrecho, Pagina } from '../componentes/Contenedor'
import { Icono } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { useEventosCreados } from '../funcionalidades/admin/eventosRecientes'
import { useEvento } from '../funcionalidades/eventos/hooks'
import { RUTAS } from '../lib/rutas'

function FilaEvento({ eventCode }: { eventCode: string }) {
  const { data } = useEvento(eventCode)
  return (
    <Tarjeta className="flex items-center justify-between gap-3 p-3">
      <p className="text-sm">
        <CodigoTexto className="text-xs">{eventCode}</CodigoTexto>
        {data && <> · {data.title}</>}
      </p>
      <div className="flex items-center gap-2">
        {data && <Badge tono={data.status} />}
        <Link to={RUTAS.adminEvento(eventCode)} className={clasesBoton('secundario', 'min-h-9')}>
          Gestionar
        </Link>
      </div>
    </Tarjeta>
  )
}

export default function AdminEventos() {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const recientes = useEventosCreados()

  const abrir = (e: FormEvent) => {
    e.preventDefault()
    if (codigo.trim()) void navigate(RUTAS.adminEvento(codigo.trim()))
  }

  return (
    <Pagina>
      <ContenedorEstrecho>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-extrabold">Administración de eventos</h1>
          <Link to={RUTAS.adminNuevo} className={clasesBoton('primario')}>
            <Icono nombre="mas" className="size-4" /> Nuevo evento
          </Link>
        </div>
        <form onSubmit={abrir} className="flex items-end gap-3" role="search" aria-label="Buscar evento por código">
          <Campo
            contenedorClassName="flex-1"
            etiqueta="Buscar evento por código"
            autoComplete="off"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
          />
          <Boton type="submit" variante="secundario">
            Abrir
          </Boton>
        </form>

        <section aria-labelledby="creados" className="mt-8 space-y-3">
          <h2 id="creados" className="text-lg font-bold">
            Creados en esta sesión
          </h2>
          {recientes.length === 0 && (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Aún no has creado eventos en esta sesión.
            </p>
          )}
          {recientes.map((c) => (
            <FilaEvento key={c} eventCode={c} />
          ))}
          <Aviso tipo="info">Nota: la API no ofrece un listado completo de eventos (GAP-01).</Aviso>
        </section>
      </ContenedorEstrecho>
    </Pagina>
  )
}
