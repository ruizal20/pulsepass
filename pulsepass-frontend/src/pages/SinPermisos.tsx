import PaginaMensaje from '../componentes/PaginaMensaje'

export default function SinPermisos() {
  return <PaginaMensaje codigo="403" mensaje="No tienes permisos para acceder a esta sección." />
}
