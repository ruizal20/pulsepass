import { useId, type ComponentProps, type ReactNode } from 'react'
import clsx from 'clsx'
import { Icono } from './Iconos'

const CONTROL =
  'block min-h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-900 dark:text-slate-100'
const BORDE_OK = 'border-slate-300 dark:border-slate-600'
const BORDE_ERROR = 'border-red-500'

interface Comun {
  etiqueta: string
  error?: string | undefined
  ayuda?: string
}

function Envoltorio({
  id,
  etiqueta,
  error,
  ayuda,
  children,
  className,
}: Comun & { id: string; children: ReactNode; className?: string | undefined }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {etiqueta}
      </label>
      {children}
      {ayuda && !error && (
        <p id={`${id}-ayuda`} className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {ayuda}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1 flex items-center gap-1 text-xs text-red-700 dark:text-red-400"
        >
          <Icono nombre="advertencia" className="size-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

function describedBy(id: string, error?: string, ayuda?: string) {
  if (error) return `${id}-error`
  return ayuda ? `${id}-ayuda` : undefined
}

interface CampoProps extends Comun, ComponentProps<'input'> {
  /** Elemento a la derecha dentro del campo (p. ej. botón de mostrar contraseña). */
  derecha?: ReactNode
  contenedorClassName?: string
}

export function Campo({
  etiqueta,
  error,
  ayuda,
  derecha,
  className,
  contenedorClassName,
  id: idProp,
  ...resto
}: CampoProps) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <Envoltorio
      id={id}
      etiqueta={etiqueta}
      error={error}
      ayuda={ayuda}
      className={contenedorClassName}
    >
      <div className="relative">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, error, ayuda)}
          className={clsx(CONTROL, error ? BORDE_ERROR : BORDE_OK, derecha && 'pr-11', className)}
          {...resto}
        />
        {derecha && <div className="absolute inset-y-0 right-1 flex items-center">{derecha}</div>}
      </div>
    </Envoltorio>
  )
}

interface SelectorProps extends Comun, ComponentProps<'select'> {
  contenedorClassName?: string
}

export function Selector({
  etiqueta,
  error,
  ayuda,
  className,
  contenedorClassName,
  id: idProp,
  children,
  ...resto
}: SelectorProps) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <Envoltorio
      id={id}
      etiqueta={etiqueta}
      error={error}
      ayuda={ayuda}
      className={contenedorClassName}
    >
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, ayuda)}
        className={clsx(CONTROL, error ? BORDE_ERROR : BORDE_OK, className)}
        {...resto}
      >
        {children}
      </select>
    </Envoltorio>
  )
}

interface AreaProps extends Comun, ComponentProps<'textarea'> {
  contenedorClassName?: string
}

export function AreaTexto({
  etiqueta,
  error,
  ayuda,
  className,
  contenedorClassName,
  id: idProp,
  ...resto
}: AreaProps) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <Envoltorio
      id={id}
      etiqueta={etiqueta}
      error={error}
      ayuda={ayuda}
      className={contenedorClassName}
    >
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, ayuda)}
        className={clsx(CONTROL, error ? BORDE_ERROR : BORDE_OK, className)}
        {...resto}
      />
    </Envoltorio>
  )
}
