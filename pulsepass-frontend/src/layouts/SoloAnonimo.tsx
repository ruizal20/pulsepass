import { Navigate, Outlet, useLocation } from 'react-router'
import { Cargando } from '../componentes/Estados'
import { Pagina } from '../componentes/Contenedor'
import { useAuth } from '../funcionalidades/auth/hooks'
import { leerEstadoNavegacion } from '../lib/estadoNavegacion'
import { RUTAS } from '../lib/rutas'

/** /login y /registro: con sesión activa redirigen (a la ruta de origen o a /). */
export default function SoloAnonimo() {
  const { sesion } = useAuth()
  const location = useLocation()

  if (sesion.estado === 'cargando')
    return (
      <Pagina>
        <Cargando />
      </Pagina>
    )
  if (sesion.estado === 'autenticado') {
    const { desde } = leerEstadoNavegacion(location.state)
    return <Navigate to={desde ?? RUTAS.inicio} replace />
  }
  return <Outlet />
}
