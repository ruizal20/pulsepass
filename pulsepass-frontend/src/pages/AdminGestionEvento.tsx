import { useState } from 'react'
import { Link, useParams } from 'react-router'
import Aviso from '../componentes/Aviso'
import { useAvisos } from '../componentes/Avisos'
import Avatar from '../componentes/Avatar'
import Badge from '../componentes/Badge'
import Boton from '../componentes/Boton'
import CodigoTexto from '../componentes/CodigoTexto'
import { Selector } from '../componentes/Campo'
import { ContenedorEstrecho, Pagina } from '../componentes/Contenedor'
import { Cargando, ErrorConsulta } from '../componentes/Estados'
import { Icono } from '../componentes/Iconos'
import Modal from '../componentes/Modal'
import Tarjeta from '../componentes/Tarjeta'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { useAsociarArtista, useEvento, usePublicarEvento } from '../funcionalidades/eventos/hooks'
import { mensajeDeError } from '../lib/errores'
import { formatearFechaHora } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

export default function AdminGestionEvento() {
  const { eventCode } = useParams()
  const avisos = useAvisos()
  const { data: evento, isPending, error, refetch } = useEvento(eventCode)
  const artistas = useArtistasActivos()
  const publicar = usePublicarEvento()
  const asociar = useAsociarArtista()
  const [modal, setModal] = useState(false)
  const [artistaId, setArtistaId] = useState('')

  const disponibles = (artistas.data ?? []).filter((a) => !evento?.artists.some((x) => x.id === a.id))

  const cerrarModal = () => {
    setModal(false)
    publicar.reset()
  }

  const confirmarPublicacion = () => {
    if (!eventCode) return
    publicar.mutate(eventCode, {
      onSuccess: () => {
        setModal(false)
        avisos.exito('Evento publicado.')
      },
    })
  }

  const asociarSeleccionado = () => {
    const id = Number(artistaId)
    if (!eventCode || !Number.isInteger(id) || id <= 0) return
    asociar.mutate(
      { eventCode, artistId: id },
      {
        onSuccess: () => {
          setArtistaId('')
          avisos.exito('Artista asociado.')
        },
      },
    )
  }

  return (
    <Pagina>
      <ContenedorEstrecho>
        <Link to={RUTAS.adminEventos} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-marca-600 hover:underline dark:text-marca-500">
          <Icono nombre="atras" className="size-4" /> Eventos
        </Link>
        {isPending && <Cargando forma="detalle" />}
        {error && (
          <ErrorConsulta error={error} onReintentar={() => void refetch()} mensajeNoDisponible="Evento no encontrado" />
        )}
        {evento && (
          <div className="space-y-5">
            <header className="space-y-1">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-3xl font-extrabold">{evento.title}</h1>
                <Badge tono={evento.status} />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                <CodigoTexto className="text-xs">{evento.eventCode}</CodigoTexto> · {evento.category} ·{' '}
                {formatearFechaHora(evento.eventDate)}
                {evento.minimumAge != null && <> · Mín. {evento.minimumAge}</>}
                {evento.venue && <> · {evento.venue.name}</>}
              </p>
            </header>

            <Tarjeta className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <h2 className="text-lg font-bold">Publicación</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  El evento es visible al público una vez publicado.
                </p>
              </div>
              <Boton disabled={evento.status !== 'DRAFT'} onClick={() => setModal(true)}>
                Publicar evento
              </Boton>
            </Tarjeta>

            <Tarjeta className="space-y-3 p-5">
              <h2 className="text-lg font-bold">Artistas asociados</h2>
              {evento.artists.length === 0 && (
                <p className="text-sm text-slate-600 dark:text-slate-400">Aún no hay artistas asociados.</p>
              )}
              <ul className="flex flex-wrap gap-3">
                {evento.artists.map((a) => (
                  <li key={a.id} className="flex items-center gap-2 text-sm font-medium">
                    <Avatar nombre={a.stageName} semilla={a.id} tamano="sm" />
                    {a.stageName}
                  </li>
                ))}
              </ul>
              <div className="flex items-end gap-3">
                <Selector
                  contenedorClassName="flex-1"
                  etiqueta="Agregar artista"
                  value={artistaId}
                  onChange={(e) => setArtistaId(e.target.value)}
                >
                  <option value="">Selecciona un artista</option>
                  {disponibles.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.stageName}
                    </option>
                  ))}
                </Selector>
                <Boton variante="secundario" disabled={!artistaId} cargando={asociar.isPending} onClick={asociarSeleccionado}>
                  <Icono nombre="mas" className="size-4" /> Asociar
                </Boton>
              </div>
              {/* El backend es la autoridad: 409 (duplicado, evento CANCELLED/FINISHED) */}
              {asociar.isError && <Aviso tipo="error" onCerrar={asociar.reset}>{mensajeDeError(asociar.error)}</Aviso>}
            </Tarjeta>

            <Link
              to={RUTAS.ticketsPagados(evento.eventCode)}
              className="inline-flex items-center gap-1 text-sm font-semibold text-marca-600 hover:underline dark:text-marca-500"
            >
              Tickets pagados <Icono nombre="flecha" className="size-4" />
            </Link>
          </div>
        )}
      </ContenedorEstrecho>

      <Modal abierto={modal} titulo="Publicar evento" onCerrar={cerrarModal}>
        <p className="text-sm">
          ¿Quieres publicar <strong>{evento?.title}</strong>? Será visible para todo el público.
        </p>
        {publicar.isError && <Aviso tipo="error">{mensajeDeError(publicar.error)}</Aviso>}
        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={cerrarModal}>
            Volver
          </Boton>
          <Boton cargando={publicar.isPending} onClick={confirmarPublicacion}>
            Publicar
          </Boton>
        </div>
      </Modal>
    </Pagina>
  )
}
