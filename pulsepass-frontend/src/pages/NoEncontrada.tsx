import PaginaMensaje from '../componentes/PaginaMensaje'

export default function NoEncontrada({ mensaje = 'No encontramos esta página' }: { mensaje?: string }) {
  return <PaginaMensaje codigo="404" mensaje={mensaje} />
}
