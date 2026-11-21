import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import { useAvisos } from '../componentes/Avisos'
import Boton, { clasesBoton } from '../componentes/Boton'
import { AreaTexto, Campo, Selector } from '../componentes/Campo'
import { ContenedorEstrecho, Pagina } from '../componentes/Contenedor'
import { Icono } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { recordarEventoCreado } from '../funcionalidades/admin/eventosRecientes'
import { useCrearEvento } from '../funcionalidades/eventos/hooks'
import {
  CAMPOS_CREAR_EVENTO,
  CrearEventoSchema,
  DESCRIPCION_MAX,
  EventCategorySchema,
  type CrearEventoForm,
} from '../funcionalidades/eventos/tipos'
import { useSedesActivas } from '../funcionalidades/sedes/hooks'
import { aplicarErroresServidor, esApiError } from '../lib/errores'
import { RUTAS } from '../lib/rutas'

export default function AdminCrearEvento() {
  const navigate = useNavigate()
  const avisos = useAvisos()
  const crear = useCrearEvento()
  const sedes = useSedesActivas()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<CrearEventoForm>({
    resolver: zodResolver(CrearEventoSchema),
    defaultValues: { category: 'MUSIC', minimumAge: 18, venueCode: '' },
  })

  const longitud = (useWatch({ control, name: 'description' }) ?? '').length

  const onSubmit = (datos: CrearEventoForm) => {
    setErrorGeneral(null)
    crear.mutate(datos, {
      onSuccess: (evento) => {
        recordarEventoCreado(evento.eventCode)
        avisos.exito('Evento creado.')
        void navigate(RUTAS.adminEvento(evento.eventCode), { state: { creado: true } })
      },
      onError: (error) => {
        if (esApiError(error, 403)) void navigate(RUTAS.sinPermisos, { replace: true })
        else setErrorGeneral(aplicarErroresServidor(error, setError, CAMPOS_CREAR_EVENTO))
      },
    })
  }

  return (
    <Pagina>
      <ContenedorEstrecho>
        <Link to={RUTAS.adminEventos} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-marca-600 hover:underline dark:text-marca-500">
          <Icono nombre="atras" className="size-4" /> Eventos
        </Link>
        <h1 className="mb-4 text-3xl font-extrabold">Nuevo evento</h1>
        <Tarjeta className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* 409 (código duplicado, fecha pasada, sede inválida) → aviso arriba del formulario */}
            {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}
            <Campo etiqueta="Código del evento" autoComplete="off" error={errors.eventCode?.message} {...register('eventCode')} />
            <Campo etiqueta="Nombre" autoComplete="off" error={errors.name?.message} {...register('name')} />
            <div>
              <AreaTexto
                etiqueta="Descripción"
                rows={4}
                error={errors.description?.message}
                {...register('description')}
              />
              <p className="mt-1 text-right text-xs text-slate-600 dark:text-slate-400">
                {longitud}/{DESCRIPCION_MAX}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[2fr_1fr]">
              <Selector etiqueta="Categoría" error={errors.category?.message} {...register('category')}>
                {EventCategorySchema.options.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Selector>
              <Campo
                etiqueta="Edad mínima"
                type="number"
                min={0}
                inputMode="numeric"
                error={errors.minimumAge?.message}
                {...register('minimumAge', { valueAsNumber: true })}
              />
            </div>
            <Campo
              etiqueta="Fecha y hora"
              type="datetime-local"
              error={errors.eventDate?.message}
              {...register('eventDate')}
            />
            <Selector etiqueta="Sede" error={errors.venueCode?.message} {...register('venueCode')}>
              <option value="">{sedes.isPending ? 'Cargando sedes…' : 'Selecciona una sede'}</option>
              {sedes.data?.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </Selector>
            {sedes.isError && <Aviso tipo="error">No pudimos cargar las sedes. Recarga la página.</Aviso>}
            <div className="flex justify-end gap-2 pt-2">
              <Link to={RUTAS.adminEventos} className={clasesBoton('secundario')}>
                Cancelar
              </Link>
              <Boton type="submit" cargando={crear.isPending}>
                Crear evento
              </Boton>
            </div>
          </form>
        </Tarjeta>
      </ContenedorEstrecho>
    </Pagina>
  )
}
