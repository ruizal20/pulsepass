import { isRouteErrorResponse, useRouteError } from 'react-router'
import Boton from '../componentes/Boton'
import PaginaMensaje from '../componentes/PaginaMensaje'

/** errorElement: mensaje seguro, sin stack trace ni detalles internos. */
export default function ErrorPagina() {
  const error = useRouteError()
  if (isRouteErrorResponse(error) && error.status === 404) {
    return <PaginaMensaje codigo="404" mensaje="No encontramos esta página" />
  }
  return (
    <PaginaMensaje
      titulo="¡Ups! Algo salió mal."
      mensaje="Ocurrió un error inesperado. Inténtalo más tarde."
      acciones={<Boton onClick={() => window.location.reload()}>Reintentar</Boton>}
    />
  )
}
