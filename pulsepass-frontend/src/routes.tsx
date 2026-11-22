import type { ComponentType } from 'react'
import type { RouteObject } from 'react-router'
import Layout from './layouts/Layout'
import RutaPorRol from './layouts/RutaPorRol'
import RutaProtegida from './layouts/RutaProtegida'
import SoloAnonimo from './layouts/SoloAnonimo'
import ErrorPagina from './pages/ErrorPagina'
import Inicio from './pages/Inicio'

/** FE-012: toda página es perezosa excepto el layout y el Inicio. */
const perezosa = (cargar: () => Promise<{ default: ComponentType }>): Pick<RouteObject, 'lazy'> => ({
  lazy: async () => ({ Component: (await cargar()).default }),
})

export const rutasApp: RouteObject[] = [
  {
    path: '/',
    Component: Layout,
    errorElement: <ErrorPagina />,
    children: [
      {
        // errorElement dentro del Layout: la barra de navegación sigue visible
        errorElement: <ErrorPagina />,
        children: [
          { index: true, Component: Inicio },
          { path: 'eventos', ...perezosa(() => import('./pages/CatalogoEventos')) },
          { path: 'eventos/:eventCode', ...perezosa(() => import('./pages/DetalleEvento')) },
          { path: 'artistas', ...perezosa(() => import('./pages/ListaArtistas')) },
          { path: 'artistas/:id', ...perezosa(() => import('./pages/DetalleArtista')) },
          { path: 'sedes', ...perezosa(() => import('./pages/ListaSedes')) },
          { path: 'sedes/:code', ...perezosa(() => import('./pages/DetalleSede')) },
          {
            Component: SoloAnonimo,
            children: [
              { path: 'login', ...perezosa(() => import('./pages/Login')) },
              { path: 'registro', ...perezosa(() => import('./pages/Registro')) },
            ],
          },
          {
            Component: RutaProtegida,
            children: [
              { path: 'cuenta', ...perezosa(() => import('./pages/Cuenta')) },
              {
                element: <RutaPorRol roles={['USER']} />,
                children: [
                  { path: 'mis-tickets', ...perezosa(() => import('./pages/MisTickets')) },
                  { path: 'mis-tickets/:ticketCode', ...perezosa(() => import('./pages/DetalleTicket')) },
                  {
                    path: 'compra/confirmacion/:ticketCode',
                    ...perezosa(() => import('./pages/ConfirmacionCompra')),
                  },
                ],
              },
              {
                element: <RutaPorRol roles={['STAFF', 'ADMIN']} />,
                children: [
                  { path: 'staff/validacion', ...perezosa(() => import('./pages/ValidacionIngreso')) },
                  // eventCode opcional: el enlace de la navbar abre la página sin evento elegido
                  {
                    path: 'staff/eventos/:eventCode?/tickets',
                    ...perezosa(() => import('./pages/TicketsPagadosEvento')),
                  },
                ],
              },
              {
                element: <RutaPorRol roles={['ADMIN']} />,
                children: [
                  { path: 'admin/eventos', ...perezosa(() => import('./pages/AdminEventos')) },
                  { path: 'admin/eventos/nuevo', ...perezosa(() => import('./pages/AdminCrearEvento')) },
                  { path: 'admin/eventos/:eventCode', ...perezosa(() => import('./pages/AdminGestionEvento')) },
                ],
              },
            ],
          },
          { path: '403', ...perezosa(() => import('./pages/SinPermisos')) },
          { path: '*', ...perezosa(() => import('./pages/NoEncontrada')) },
        ],
      },
    ],
  },
]
