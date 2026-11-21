import { Pagina } from '../componentes/Contenedor'
import { Cargando, EstadoError, EstadoVacio } from '../componentes/Estados'
import TarjetaSede from '../funcionalidades/sedes/componentes/TarjetaSede'
import { useSedesActivas } from '../funcionalidades/sedes/hooks'
import { mensajeDeError } from '../lib/errores'

export default function ListaSedes() {
  const { data, isPending, isError, error, refetch } = useSedesActivas()
  return (
    <Pagina>
      <h1 className="mb-6 text-3xl font-extrabold">Sedes</h1>
      {isPending && <Cargando forma="lista" filas={3} />}
      {isError && <EstadoError mensaje={mensajeDeError(error)} onReintentar={() => void refetch()} />}
      {data?.length === 0 && <EstadoVacio mensaje="Aún no hay sedes activas" />}
      {data && data.length > 0 && (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => (
            <li key={s.code}>
              <TarjetaSede sede={s} />
            </li>
          ))}
        </ul>
      )}
    </Pagina>
  )
}
