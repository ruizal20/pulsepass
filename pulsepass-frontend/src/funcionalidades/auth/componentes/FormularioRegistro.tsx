import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router'
import clsx from 'clsx'
import Aviso from '../../../componentes/Aviso'
import Boton from '../../../componentes/Boton'
import { Campo } from '../../../componentes/Campo'
import { aplicarErroresServidor, esApiError } from '../../../lib/errores'
import { RUTAS } from '../../../lib/rutas'
import { useRegistrarUsuario } from '../../usuarios/hooks'
import {
  CAMPOS_REGISTRO,
  RegistroSchema,
  fortalezaPassword,
  type RegistroForm,
} from '../../usuarios/tipos'
import CampoPassword from './CampoPassword'

const COLOR_NIVEL = {
  1: 'bg-red-500',
  2: 'bg-amber-500',
  3: 'bg-emerald-500',
} as const

export default function FormularioRegistro() {
  const navigate = useNavigate()
  const registrar = useRegistrarUsuario()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<RegistroForm>({ resolver: zodResolver(RegistroSchema) })

  const fortaleza = fortalezaPassword(useWatch({ control, name: 'password' }) ?? '')
  const hoy = new Date().toISOString().slice(0, 10)

  const onSubmit = (datos: RegistroForm) => {
    setErrorGeneral(null)
    registrar.mutate(datos, {
      onSuccess: () => void navigate(RUTAS.login, { state: { registrado: true } }),
      onError: (error) => {
        // AC-FE-007: duplicado → mensaje genérico sin detalles internos
        if (esApiError(error, 409)) setErrorGeneral('El usuario o correo ya está registrado.')
        else setErrorGeneral(aplicarErroresServidor(error, setError, CAMPOS_REGISTRO))
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <Campo
        etiqueta="Nombre de usuario"
        autoComplete="username"
        error={errors.username?.message}
        {...register('username')}
      />
      <Campo
        etiqueta="Correo electrónico"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo
          etiqueta="Nombres"
          autoComplete="given-name"
          error={errors.firstName?.message}
          {...register('firstName')}
        />
        <Campo
          etiqueta="Apellidos"
          autoComplete="family-name"
          error={errors.lastName?.message}
          {...register('lastName')}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Campo
          etiqueta="Teléfono"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Campo
          etiqueta="Ciudad"
          autoComplete="address-level2"
          error={errors.city?.message}
          {...register('city')}
        />
      </div>
      <Campo
        etiqueta="Fecha de nacimiento"
        type="date"
        max={hoy}
        autoComplete="bday"
        error={errors.birthDate?.message}
        {...register('birthDate')}
      />
      <div>
        <CampoPassword
          etiqueta="Contraseña (mín. 12 caracteres)"
          autoComplete="new-password"
          ayuda="Entre 12 caracteres y 72 bytes."
          error={errors.password?.message}
          {...register('password')}
        />
        {fortaleza.nivel > 0 && (
          <div className="mt-2" aria-live="polite">
            <div className="flex gap-1" aria-hidden="true">
              {[1, 2, 3].map((n) => (
                <span
                  key={n}
                  className={clsx(
                    'h-1.5 flex-1 rounded-full',
                    n <= fortaleza.nivel
                      ? COLOR_NIVEL[fortaleza.nivel as 1 | 2 | 3]
                      : 'bg-slate-200 dark:bg-slate-700',
                  )}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Fortaleza: {fortaleza.etiqueta}
            </p>
          </div>
        )}
      </div>
      {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}
      <Boton type="submit" cargando={registrar.isPending} className="w-full">
        Crear cuenta
      </Boton>
    </form>
  )
}
