import { screen } from '@testing-library/react'
import { render } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it, vi } from 'vitest'
import ErrorPagina from '../ErrorPagina'
import { renderApp } from '../../test/utils'

describe('Páginas transversales', () => {
  it('TEST-FE-GEN-001 / AC-FE-020: ruta inexistente → 404', async () => {
    renderApp({ ruta: '/esta/ruta/no/existe' })
    expect(await screen.findByText('No encontramos esta página')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toBeInTheDocument()
  })

  it('TEST-FE-GEN-002: errorElement muestra un mensaje seguro (sin stack ni detalles)', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const router = createMemoryRouter(
      [
        {
          path: '/',
          loader: () => {
            throw new Error('SECRETO interno: NullPointerException en Servicio.java:42')
          },
          element: <p>no se debe ver</p>,
          errorElement: <ErrorPagina />,
        },
      ],
      { initialEntries: ['/'] },
    )
    render(<RouterProvider router={router} />)
    expect(await screen.findByText('¡Ups! Algo salió mal.')).toBeInTheDocument()
    expect(screen.getByText('Ocurrió un error inesperado. Inténtalo más tarde.')).toBeInTheDocument()
    expect(screen.queryByText(/SECRETO|NullPointer|Servicio\.java/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
    vi.restoreAllMocks()
  })
})
