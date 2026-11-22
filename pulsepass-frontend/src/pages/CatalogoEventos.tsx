import { useSearchParams } from 'react-router'
import { Pagina } from '../componentes/Contenedor'
import { Cargando, EstadoError, EstadoVacio } from '../componentes/Estados'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import BarraFiltros from '../funcionalidades/eventos/componentes/BarraFiltros'
import GrillaEventos from '../funcionalidades/eventos/componentes/GrillaEventos'
import { useEventosPorArtista, useEventosPublicados } from '../funcionalidades/eventos/hooks'
import { EventCategorySchema } from '../funcionalidades/eventos/tipos'
import { mensajeDeError } from '../lib/errores'

export default function CatalogoEventos() {
  // FR-FE-EVT-002: los filtros viven en la URL (?q=&categoria=&artista=)
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const categoriaValida = EventCategorySchema.safeParse(params.get('categoria'))
  const categoria = categoriaValida.success ? categoriaValida.data : ''
  const artista = params.get('artista') ?? ''

  const publicados = useEventosPublicados()
  const porArtista = useEventosPorArtista(artista || undefined)
  const artistas = useArtistasActivos()
  const consulta = artista ? porArtista : publicados

  const cambiar = (clave: 'q' | 'categoria' | 'artista', valor: string) => {
    const siguiente = new URLSearchParams(params)
    if (valor) siguiente.set(clave, valor)
    else siguiente.delete(clave)
    setParams(siguiente, { replace: true })
  }

  // Búsqueda por artista: nunca se muestran borradores al público (GAP-02)
  const eventos = (consulta.data ?? [])
    .filter((e) => e.status !== 'DRAFT')
    .filter((e) => e.title.toLowerCase().includes(q.trim().toLowerCase()))
    .filter((e) => !categoria || e.category === categoria)

  return (
    <Pagina>
      <h1 className="mb-6 text-3xl font-extrabold">Cartelera</h1>
      <BarraFiltros
        q={q}
        categoria={categoria}
        artista={artista}
        artistas={artistas.data ?? []}
        onCambio={cambiar}
        onLimpiar={() => setParams({}, { replace: true })}
      />
      <div className="mt-4 space-y-4">
        {consulta.isSuccess && (
          <p className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
            {eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}
          </p>
        )}
        {consulta.isPending && consulta.fetchStatus !== 'idle' && <Cargando forma="tarjetas" filas={6} />}
        {consulta.isError && (
          <EstadoError mensaje={mensajeDeError(consulta.error)} onReintentar={() => void consulta.refetch()} />
        )}
        {consulta.isSuccess && eventos.length === 0 && (
          <EstadoVacio icono="buscar" mensaje="Sin resultados para tu búsqueda" />
        )}
        {eventos.length > 0 && <GrillaEventos eventos={eventos} />}
      </div>
    </Pagina>
  )
}
