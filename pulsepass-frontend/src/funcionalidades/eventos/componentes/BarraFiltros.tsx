import Boton from '../../../componentes/Boton'
import { Campo, Selector } from '../../../componentes/Campo'
import type { Artista } from '../../artistas/tipos'
import { EventCategorySchema } from '../tipos'

interface Props {
  q: string
  categoria: string
  artista: string
  artistas: Artista[]
  onCambio: (clave: 'q' | 'categoria' | 'artista', valor: string) => void
  onLimpiar: () => void
}

export default function BarraFiltros({ q, categoria, artista, artistas, onCambio, onLimpiar }: Props) {
  return (
    <form
      role="search"
      aria-label="Filtrar eventos"
      onSubmit={(e) => e.preventDefault()}
      className="grid grid-cols-1 items-end gap-3 md:grid-cols-[2fr_1fr_1fr_auto]"
    >
      <Campo
        etiqueta="Buscar por nombre"
        type="search"
        placeholder="Buscar por nombre…"
        value={q}
        onChange={(e) => onCambio('q', e.target.value)}
      />
      <Selector
        etiqueta="Categoría"
        value={categoria}
        onChange={(e) => onCambio('categoria', e.target.value)}
      >
        <option value="">Todas</option>
        {EventCategorySchema.options.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Selector>
      <Selector etiqueta="Artista" value={artista} onChange={(e) => onCambio('artista', e.target.value)}>
        <option value="">Todos</option>
        {artistas.map((a) => (
          <option key={a.id} value={a.stageName}>
            {a.stageName}
          </option>
        ))}
      </Selector>
      <Boton variante="secundario" onClick={onLimpiar}>
        Limpiar
      </Boton>
    </form>
  )
}
