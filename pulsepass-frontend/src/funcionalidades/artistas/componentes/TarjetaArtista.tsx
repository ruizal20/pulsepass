import { Link } from 'react-router'
import Avatar from '../../../componentes/Avatar'
import Tarjeta from '../../../componentes/Tarjeta'
import { RUTAS } from '../../../lib/rutas'
import type { Artista } from '../tipos'

export default function TarjetaArtista({ artista }: { artista: Artista }) {
  return (
    <Link to={RUTAS.artista(artista.id)} className="block rounded-xl">
      <Tarjeta className="flex flex-col items-center gap-2 p-5 text-center transition-shadow hover:shadow-md">
        <Avatar nombre={artista.stageName} semilla={artista.id} tamano="lg" />
        <h3 className="font-semibold">{artista.stageName}</h3>
        {artista.musicalGenre && (
          <p className="text-sm text-slate-600 dark:text-slate-400">{artista.musicalGenre}</p>
        )}
      </Tarjeta>
    </Link>
  )
}
