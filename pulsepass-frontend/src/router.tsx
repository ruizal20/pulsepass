import { createBrowserRouter } from 'react-router'
import { rutasApp } from './routes'

// FE-007: un solo enfoque de enrutamiento (createBrowserRouter + RouterProvider).
export const router = createBrowserRouter(rutasApp)
