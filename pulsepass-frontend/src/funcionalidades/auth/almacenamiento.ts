import { SesionGuardadaSchema, type SesionGuardada } from './tipos'

const CLAVE = 'pulsepass.sesion'

/** sessionStorage (se pierde al cerrar la pestaña). Nunca localStorage ni cookies. */
export function leerSesionGuardada(ahora: number = Date.now()): SesionGuardada | null {
  try {
    const crudo = sessionStorage.getItem(CLAVE)
    if (!crudo) return null
    const r = SesionGuardadaSchema.safeParse(JSON.parse(crudo))
    if (!r.success || r.data.expiraEn <= ahora) {
      sessionStorage.removeItem(CLAVE)
      return null
    }
    return r.data
  } catch {
    return null
  }
}

export function guardarSesion(sesion: SesionGuardada): void {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify(sesion))
  } catch {
    /* almacenamiento no disponible: la sesión vive solo en memoria */
  }
}

export function borrarSesionGuardada(): void {
  try {
    sessionStorage.removeItem(CLAVE)
  } catch {
    /* noop */
  }
}
