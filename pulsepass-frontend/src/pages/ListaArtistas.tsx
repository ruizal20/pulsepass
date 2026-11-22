import { Pagina } from '../componentes/Contenedor'
import { Cargando, EstadoError, EstadoVacio } from '../componentes/Estados'
import TarjetaArtista from '../funcionalidades/artistas/componentes/TarjetaArtista'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { mensajeDeError } from '../lib/errores'

export default function ListaArtistas() {
  const { data, isPending, isError, error, refetch } = useArtistasActivos()
  return (
    <Pagina>
      <h1 className="mb-6 text-3xl font-extrabold">Artistas</h1>
      {isPending && <Cargando forma="tarjetas" filas={3} />}
      {isError && <EstadoError mensaje={mensajeDeError(error)} onReintentar={() => void refetch()} />}
      {data?.length === 0 && <EstadoVacio mensaje="Aún no hay artistas activos" />}
      {data && data.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((a) => (
            <li key={a.id}>
              <TarjetaArtista artista={a} />
            </li>
          ))}
        </ul>
      )}
    </Pagina>
  )
}
