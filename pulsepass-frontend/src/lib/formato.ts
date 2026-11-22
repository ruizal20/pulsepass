const fechaCorta = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const hora = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })
const moneda = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

/** El backend envía LocalDateTime sin zona ("2026-12-12T20:00:00"): se interpreta como hora local. */
function aFecha(valor: string): Date | null {
  const d = new Date(valor)
  return Number.isNaN(d.getTime()) ? null : d
}

/** "12 dic 2026": se arma con partes para no depender de los patrones ("12 de dic de 2026") de cada motor ICU. */
function fechaCortaTexto(d: Date): string {
  const partes = fechaCorta.formatToParts(d)
  const valor = (tipo: Intl.DateTimeFormatPartTypes) =>
    (partes.find((p) => p.type === tipo)?.value ?? '').replace(/\./g, '')
  return `${valor('day')} ${valor('month')} ${valor('year')}`
}

/** "12 dic 2026" */
export function formatearFecha(valor: string): string {
  const d = aFecha(valor)
  return d ? fechaCortaTexto(d) : valor
}

/** "12 dic 2026 · 20:00" */
export function formatearFechaHora(valor: string): string {
  const d = aFecha(valor)
  return d ? `${fechaCortaTexto(d)} · ${hora.format(d)}` : valor
}

/** "05 nov 2026 14:32" */
export function formatearFechaHoraCorta(valor: string): string {
  const d = aFecha(valor)
  return d ? `${fechaCortaTexto(d)} ${hora.format(d)}` : valor
}

/** Fecha pura (LocalDate "1998-04-12") sin desfase por zona horaria → "12/04/1998". */
export function formatearFechaNacimiento(valor: string): string {
  const [anio, mes, dia] = valor.split('-')
  return anio && mes && dia ? `${dia}/${mes}/${anio}` : valor
}

/** 250000 → "$ 250.000" */
export function formatearCOP(valor: number): string {
  return moneda.format(valor).replace(/\u00a0/g, ' ')
}

export function iniciales(texto: string): string {
  const partes = texto.trim().split(/\s+/).filter(Boolean)
  return partes.slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join('') || '?'
}
