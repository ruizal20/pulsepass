import type { ReactNode } from 'react'
import clsx from 'clsx'
import { esApiError, mensajeDeError } from '../lib/errores'
import Aviso from './Aviso'
import Boton from './Boton'
import { Icono, type NombreIcono } from './Iconos'
import Tarjeta from './Tarjeta'

/** Estado "cargando": esqueletos con la forma del contenido (FE-014). */
export function Cargando({
  forma = 'lista',
  filas = 3,
}: {
  forma?: 'lista' | 'tarjetas' | 'detalle'
  filas?: number
}) {
  const bloque = 'animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800'
  return (
    <div role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      {forma === 'tarjetas' && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: filas }, (_, i) => (
            <Tarjeta key={i} className="overflow-hidden">
              <div className={clsx(bloque, 'h-32 rounded-none')} />
              <div className="space-y-2 p-4">
                <div className={clsx(bloque, 'h-3 w-1/3')} />
                <div className={clsx(bloque, 'h-5 w-3/4')} />
                <div className={clsx(bloque, 'h-3 w-1/2')} />
              </div>
            </Tarjeta>
          ))}
        </div>
      )}
      {forma === 'lista' && (
        <div className="space-y-3">
          {Array.from({ length: filas }, (_, i) => (
            <div key={i} className={clsx(bloque, 'h-20')} />
          ))}
        </div>
      )}
      {forma === 'detalle' && (
        <div className="space-y-3">
          <div className={clsx(bloque, 'h-48')} />
          <div className={clsx(bloque, 'h-6 w-2/3')} />
          <div className={clsx(bloque, 'h-4 w-1/2')} />
          <div className={clsx(bloque, 'h-4 w-full')} />
        </div>
      )}
    </div>
  )
}

export function EstadoVacio({
  mensaje,
  icono = 'bandeja',
  accion,
}: {
  mensaje: string
  icono?: NombreIcono
  accion?: ReactNode
}) {
  return (
    <Tarjeta className="flex flex-col items-center gap-3 p-8 text-center">
      <Icono nombre={icono} className="size-8 text-slate-500 dark:text-slate-400" />
      <p className="font-semibold">{mensaje}</p>
      {accion}
    </Tarjeta>
  )
}

export function EstadoError({ mensaje, onReintentar }: { mensaje: string; onReintentar?: () => void }) {
  return (
    <Tarjeta className="space-y-3 p-6">
      <Aviso tipo="error">{mensaje}</Aviso>
      {onReintentar && <Boton onClick={onReintentar}>Reintentar</Boton>}
    </Tarjeta>
  )
}

/**
 * Traduce el error de una consulta (PRD §13) a la pantalla adecuada:
 * 404/403 → "no disponible" sin revelar existencia; resto → mensaje + reintentar.
 */
export function ErrorConsulta({
  error,
  onReintentar,
  mensajeNoDisponible = 'No disponible',
  accionVolver,
}: {
  error: unknown
  onReintentar?: () => void
  mensajeNoDisponible?: string
  accionVolver?: ReactNode
}) {
  if (esApiError(error, 404, 403)) {
    return <EstadoVacio icono="advertencia" mensaje={mensajeNoDisponible} accion={accionVolver} />
  }
  return <EstadoError mensaje={mensajeDeError(error)} {...(onReintentar && { onReintentar })} />
}
