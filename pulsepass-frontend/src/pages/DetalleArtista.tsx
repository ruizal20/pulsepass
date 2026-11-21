import { Link, useParams } from 'react-router'
import Avatar from '../componentes/Avatar'
import Badge from '../componentes/Badge'
import { Pagina } from '../componentes/Contenedor'
import { Cargando, EstadoError, EstadoVacio } from '../componentes/Estados'
import { Icono } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { useArtista } from '../funcionalidades/artistas/hooks'
import GrillaEventos from '../funcionalidades/eventos/componentes/GrillaEventos'
import { useEventosPorArtista } from '../funcionalidades/eventos/hooks'
import { esApiError, mensajeDeError } from '../lib/errores'
import { RUTAS } from '../lib/rutas'
import NoEncontrada from './NoEncontrada'

export default function DetalleArtista() {
  const { id } = useParams()
  // Validación del parámetro: si no es un entero válido → 404 de UI sin llamar a la API
  const numero = id !== undefined && /^\d+$/.test(id) ? Number(id) : undefined
  const artista = useArtista(numero)
  const eventos = useEventosPorArtista(artista.data?.stageName)

  if (numero === undefined || esApiError(artista.error, 404)) {
    return <NoEncontrada mensaje="No encontramos a este artista" />
  }

  const proximos = (eventos.data ?? []).filter((e) => e.status !== 'DRAFT')

  return (
    <Pagina>
      <Link to={RUTAS.artistas} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-marca-600 hover:underline dark:text-marca-500">
        <Icono nombre="atras" className="size-4" /> Artistas
      </Link>
      {artista.isPending && <Cargando forma="detalle" />}
      {artista.isError && (
        <EstadoError mensaje={mensajeDeError(artista.error)} onReintentar={() => void artista.refetch()} />
      )}
      {artista.data && (
        <div className="space-y-8">
          <Tarjeta className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center">
            <Avatar nombre={artista.data.stageName} semilla={artista.data.id} tamano="lg" />
            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold">{artista.data.stageName}</h1>
              {artista.data.musicalGenre && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Nombre artístico · {artista.data.musicalGenre}
                </p>
              )}
              <Badge tono="ACTIVA">Activo</Badge>
              {artista.data.biography && <p className="pt-2">{artista.data.biography}</p>}
            </div>
          </Tarjeta>

          <section aria-labelledby="proximos-artista" className="space-y-4">
            <h2 id="proximos-artista" className="text-xl font-bold">
              Próximos eventos de {artista.data.stageName}
            </h2>
            {eventos.isPending && <Cargando forma="tarjetas" filas={2} />}
            {eventos.isError && (
              <EstadoError mensaje={mensajeDeError(eventos.error)} onReintentar={() => void eventos.refetch()} />
            )}
            {eventos.isSuccess && proximos.length === 0 && <EstadoVacio mensaje="Sin eventos próximos" />}
            {proximos.length > 0 && <GrillaEventos eventos={proximos} />}
          </section>
        </div>
      )}
    </Pagina>
  )
}
