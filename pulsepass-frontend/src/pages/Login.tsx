import { Link } from 'react-router'
import { ContenedorEstrecho, Pagina } from '../componentes/Contenedor'
import Tarjeta from '../componentes/Tarjeta'
import FormularioLogin from '../funcionalidades/auth/componentes/FormularioLogin'
import LogoMarca from '../funcionalidades/auth/componentes/LogoMarca'
import { RUTAS } from '../lib/rutas'

export default function Login() {
  return (
    <Pagina>
      <ContenedorEstrecho>
        <Tarjeta className="mx-auto max-w-md space-y-5 p-6">
          <div className="flex flex-col items-center gap-2">
            <LogoMarca />
            <h1 className="text-2xl font-extrabold">Inicia sesión</h1>
          </div>
          <FormularioLogin />
          <p className="text-center text-sm">
            ¿No tienes cuenta?{' '}
            <Link to={RUTAS.registro} className="font-semibold text-marca-600 hover:underline dark:text-marca-500">
              Regístrate
            </Link>
          </p>
        </Tarjeta>
      </ContenedorEstrecho>
    </Pagina>
  )
}
