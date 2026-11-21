/** Datos de referencia (PRD §22) con la forma REAL de los DTO del backend. */
export const sede = {
  id: 1,
  code: 'VEN-SMR-01',
  name: 'Marina Convention Center',
  city: 'Santa Marta',
  address: 'Carrera 1 # 2-3',
  capacity: 3,
  active: true,
}

type ArtistaMock = { id: number; stageName: string; biography: string | null; musicalGenre: string }
export const solarBeat: ArtistaMock = { id: 1, stageName: 'Solar Beat', biography: 'Electrónica caribeña', musicalGenre: 'Electrónica' }
export const neonWaves: ArtistaMock = { id: 2, stageName: 'Neon Waves', biography: null, musicalGenre: 'Synthwave' }
export const caribbeanSound: ArtistaMock = { id: 3, stageName: 'Caribbean Sound', biography: null, musicalGenre: 'Fusión caribeña' }
export const artistas: ArtistaMock[] = [solarBeat, neonWaves, caribbeanSound]

export const eventoCMF = {
  id: 1,
  eventCode: 'CMF-2026',
  title: 'Caribbean Music Fest 2026',
  description: 'Tres noches de música caribeña.',
  category: 'MUSIC',
  status: 'PUBLISHED',
  eventDate: '2027-12-12T20:00:00',
  minimumAge: 18,
  streamingUrl: null,
  venue: sede,
  artists: [solarBeat, neonWaves] as ArtistaMock[],
}

export const eventoAgotado = {
  ...eventoCMF,
  id: 2,
  eventCode: 'TCC-2027',
  title: 'Cumbre Tech Caribe 2027',
  category: 'TECHNOLOGY',
  status: 'SOLD_OUT',
  artists: [] as ArtistaMock[],
}

export const eventoCultura = {
  ...eventoCMF,
  id: 3,
  eventCode: 'NJC-2026',
  title: 'Noche de Jazz y Cultura',
  category: 'CULTURE',
  artists: [caribbeanSound] as ArtistaMock[],
}

export const eventoBorrador = {
  ...eventoCMF,
  id: 4,
  eventCode: 'DRF-2027',
  title: 'Evento en borrador',
  status: 'DRAFT',
  artists: [] as ArtistaMock[],
}

export const ticketVIP = {
  id: 10,
  ticketCode: 'TKT-8F2A1C',
  type: 'VIP',
  price: 250000,
  status: 'PAID',
  purchaseDate: '2026-11-05T14:32:00',
  event: eventoCMF,
}
export const ticketUsado = {
  ...ticketVIP,
  id: 11,
  ticketCode: 'TKT-5C90E2',
  type: 'GENERAL',
  price: 90000,
  status: 'USED',
  purchaseDate: '2026-10-12T10:00:00',
}
export const ticketCancelado = {
  ...ticketVIP,
  id: 12,
  ticketCode: 'TKT-77AD13',
  type: 'STUDENT',
  price: 60000,
  status: 'CANCELLED',
  purchaseDate: '2026-10-01T09:00:00',
}

export const usuarioAndrea = {
  id: 1,
  username: 'andrea',
  email: 'andrea@pulsepass.test',
  active: true,
  profile: {
    id: 1,
    firstName: 'Andrea',
    lastName: 'Ruiz',
    phone: '3001234567',
    city: 'Santa Marta',
    birthDate: '1998-04-12',
  },
}

/** token → usuario devuelto por GET /api/auth/me */
export const usuariosPorToken: Record<string, { username: string; email: string; roles: string[] }> = {
  'tok-USER': { username: 'andrea', email: 'andrea@pulsepass.test', roles: ['ROLE_USER'] },
  'tok-STAFF': { username: 'laura', email: 'laura@pulsepass.test', roles: ['ROLE_STAFF'] },
  'tok-ADMIN': { username: 'admin', email: 'admin@pulsepass.test', roles: ['ROLE_ADMIN'] },
}
