// v2: 4 primitive types
export const CAPTURE_TYPES = ['fact', 'idea', 'tarea', 'referencia'] as const
export type CaptureType = typeof CAPTURE_TYPES[number]

export const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  fact:       { label: 'Fact',       color: '#4ea8db', bg: 'rgba(78, 168, 219, 0.12)',   icon: '●' },
  idea:       { label: 'Idea',       color: '#bb87fc', bg: 'rgba(187, 135, 252, 0.12)',  icon: '◇' },
  tarea:      { label: 'Tarea',      color: '#e8ab5e', bg: 'rgba(232, 171, 94, 0.12)',   icon: '○' },
  referencia: { label: 'Referencia', color: '#8b9ab0', bg: 'rgba(139, 154, 176, 0.12)', icon: '→' },
}

export const DOMAIN_CONFIG: Record<string, { label: string; color: string }> = {
  finca:       { label: 'Finca',       color: '#6bc9a0' },
  vecino:      { label: 'Vecino',      color: '#d4636c' },
  canticuento: { label: 'Canticuento', color: '#bb87fc' },
  personal:    { label: 'Personal',    color: '#e07eb4' },
  familia:     { label: 'Familia',     color: '#4ea8db' },
  abeja:       { label: 'Abeja',       color: '#e8ab5e' },
  sandbox:     { label: 'Sandbox',     color: '#8b9ab0' },
  govtech:     { label: 'Govtech',     color: '#6bc9a0' },
}

// Legacy compat
export const DOMAIN_EMOJI: Record<string, string> = {}
