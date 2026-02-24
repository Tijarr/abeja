// v2: 4 primitive types
export const CAPTURE_TYPES = ['fact', 'idea', 'tarea', 'referencia'] as const
export type CaptureType = typeof CAPTURE_TYPES[number]

export const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  fact:       { label: 'Fact',       color: '#4ea8db', bg: '#162832', icon: '●' },
  idea:       { label: 'Idea',       color: '#bb87fc', bg: '#231b33', icon: '◇' },
  tarea:      { label: 'Tarea',      color: '#e8ab5e', bg: '#2a2117', icon: '○' },
  referencia: { label: 'Referencia', color: '#8b9ab0', bg: '#1e2128', icon: '→' },
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
