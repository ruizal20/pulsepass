import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router'
import Aviso from '../../../componentes/Aviso'
import Boton from '../../../componentes/Boton'
import { Campo } from '../../../componentes/Campo'
import { aplicarErroresServidor, esApiError } from '../../../lib/errores'
import { leerEstadoNavegacion } from '../../../lib/estadoNavegacion'
import { RUTAS } from '../../../lib/rutas'
import { useAuth } from '../hooks'
import { LoginSchema, type LoginForm } from '../tipos'
import CampoPassword from './CampoPassword'

export default function FormularioLogin() {
  const { iniciarSesion, sesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const estado = leerEstadoNavegacion(location.state)
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(LoginSchema) })

  const expirada = estado.motivo === 'expirada' || (sesion.estado === 'anonimo' && sesion.expirada)

  const onSubmit = async (datos: LoginForm) => {
    setErrorGeneral(null)
    try {
      await iniciarSesion(datos.identifier, datos.password)
      void navigate(estado.desde ?? RUTAS.inicio, { replace: true })
    } catch (error) {
      // AC-FE-008: mensaje genérico; nunca se distingue usuario inexistente de contraseña errónea
      if (esApiError(error, 401)) setErrorGeneral('Credenciales inválidas.')
      else setErrorGeneral(aplicarErroresServidor(error, setError, ['identifier', 'password']))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {estado.registrado && <Aviso tipo="exito">Cuenta creada, inicia sesión.</Aviso>}
      {expirada && <Aviso tipo="info">Tu sesión expiró. Inicia sesión de nuevo.</Aviso>}
      <Campo
        etiqueta="Usuario o correo"
        autoComplete="username"
        error={errors.identifier?.message}
        {...register('identifier')}
      />
      <CampoPassword
        etiqueta="Contraseña"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register('password')}
      />
      {errorGeneral && <Aviso tipo="error">{errorGeneral}</Aviso>}
      <Boton type="submit" cargando={isSubmitting} className="w-full">
        Ingresar
      </Boton>
    </form>
  )
}
