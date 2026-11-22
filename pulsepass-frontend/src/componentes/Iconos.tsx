import type { ReactNode, SVGProps } from 'react'

/** DES-01: iconografía SVG de trazo (sin emojis). Decorativos con aria-hidden. */
const TRAZOS = {
  musica: (
    <>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </>
  ),
  monitor: (
    <>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  balon: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2v20M2 12h20" />
    </>
  ),
  museo: (
    <>
      <path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10l10-7 10 7z" />
    </>
  ),
  birrete: (
    <>
      <path d="M22 10 12 5 2 10l10 5z" />
      <path d="M6 12v5c3 2.5 9 2.5 12 0v-5" />
    </>
  ),
  estrella: <path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" />,
  calendario: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  flecha: <path d="M5 12h14M13 6l6 6-6 6" />,
  atras: <path d="M19 12H5M11 6l-6 6 6 6" />,
  buscar: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  ojo: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  ojoTachado: (
    <>
      <path d="M17.9 17.9A10.4 10.4 0 0 1 12 19c-6 0-10-7-10-7a18 18 0 0 1 4.1-4.9M9.9 5.2A9.7 9.7 0 0 1 12 5c6 0 10 7 10 7a18 18 0 0 1-2.2 3.2M3 3l18 18" />
    </>
  ),
  advertencia: (
    <>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  cerrar: <path d="M18 6 6 18M6 6l12 12" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  ticket: (
    <>
      <path d="M2 9a3 3 0 0 0 0 6v3a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-3a3 3 0 0 1 0-6V6a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1z" />
      <path d="M13 5v2M13 17v2M13 11v2" />
    </>
  ),
  copiar: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  bandeja: (
    <>
      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
      <path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z" />
    </>
  ),
  rayo: <path d="M13 2 3 14h9l-1 8 10-12h-9z" />,
  sol: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  luna: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  mas: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  sede: (
    <>
      <path d="M3 21V9l9-6 9 6v12z" />
      <path d="M9 21v-7h6v7" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type NombreIcono = keyof typeof TRAZOS

interface Props extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  nombre: NombreIcono
  /** Si se da un título el ícono deja de ser decorativo. */
  titulo?: string
}

export function Icono({ nombre, titulo, className = 'size-5', ...resto }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={titulo ? undefined : true}
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      {...resto}
    >
      {TRAZOS[nombre]}
    </svg>
  )
}
