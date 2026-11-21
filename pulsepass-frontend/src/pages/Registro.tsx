import { Link } from 'react-router'
import { ContenedorEstrecho, Pagina } from '../componentes/Contenedor'
import Tarjeta from '../componentes/Tarjeta'
import FormularioRegistro from '../funcionalidades/auth/componentes/FormularioRegistro'
import LogoMarca from '../funcionalidades/auth/componentes/LogoMarca'
import { RUTAS } from '../lib/rutas'

export default function Registro() {
  return (
    <Pagina>
      <ContenedorEstrecho>
        <Tarjeta className="mx-auto max-w-lg space-y-5 p-6">
          <div className="flex flex-col items-center gap-2">
            <LogoMarca />
            <h1 className="text-2xl font-extrabold">Crea tu cuenta</h1>
          </div>
          <FormularioRegistro />
          <p className="text-center text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link to={RUTAS.login} className="font-semibold text-marca-600 hover:underline dark:text-marca-500">
              Inicia sesión
            </Link>
          </p>
        </Tarjeta>
      </ContenedorEstrecho>
    </Pagina>
  )
}
