import { Navigate, Outlet, useLocation } from 'react-router'
import { Cargando } from '../componentes/Estados'
import { Pagina } from '../componentes/Contenedor'
import { useAuth } from '../funcionalidades/auth/hooks'
import { RUTAS } from '../lib/rutas'

/** Layout route: exige sesión. Solo UX; la seguridad real la aplica el servidor (FE-004). */
export default function RutaProtegida() {
  const { sesion } = useAuth()
  const location = useLocation()

  if (sesion.estado === 'cargando')
    return (
      <Pagina>
        <Cargando />
      </Pagina>
    )
  if (sesion.estado === 'anonimo')
    return (
      <Navigate
        to={RUTAS.login}
        replace
        state={{
          desde: location.pathname + location.search,
          ...(sesion.expirada && { motivo: 'expirada' as const }),
        }}
      />
    )
  return <Outlet />
}
