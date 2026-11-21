import { Link, useParams } from 'react-router'
import Badge from '../componentes/Badge'
import { ContenedorEstrecho, Pagina } from '../componentes/Contenedor'
import { Cargando, EstadoError } from '../componentes/Estados'
import { Icono } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { useSede } from '../funcionalidades/sedes/hooks'
import { esApiError, mensajeDeError } from '../lib/errores'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

export default function DetalleSede() {
  const { code } = useParams()
  const { data: sede, isPending, error, refetch } = useSede(code)

  if (esApiError(error, 404)) return <NoEncontrada mensaje="No encontramos esta sede" />

  const filas: [string, string][] = sede
    ? [
        ['Código', sede.code],
        ['Ciudad', sede.city],
        ...(sede.address ? [['Dirección', sede.address] as [string, string]] : []),
        ['Capacidad', `${sede.capacity.toLocaleString('es-CO')} personas`],
        ['Estado', sede.active ? 'Activa' : 'Inactiva'],
      ]
    : []

  return (
    <Pagina>
      <ContenedorEstrecho>
        <Link to={RUTAS.sedes} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-marca-600 hover:underline dark:text-marca-500">
          <Icono nombre="atras" className="size-4" /> Sedes
        </Link>
        {isPending && <Cargando forma="detalle" />}
        {error && <EstadoError mensaje={mensajeDeError(error)} onReintentar={() => void refetch()} />}
        {sede && (
          <Tarjeta className="space-y-3 p-6">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl font-extrabold">{sede.name}</h1>
              <Badge tono={sede.active ? 'ACTIVA' : 'INACTIVA'}>{sede.active ? 'Activa' : 'Inactiva'}</Badge>
            </div>
            <dl className="text-sm">
              {filas.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-slate-100 py-2 dark:border-slate-800">
                  <dt className="text-slate-600 dark:text-slate-400">{k}</dt>
                  <dd className="text-right font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </Tarjeta>
        )}
      </ContenedorEstrecho>
    </Pagina>
  )
}
