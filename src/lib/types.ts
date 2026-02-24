export const CAPTURE_TYPES = ['task','idea','assertion','reflection','reference','concept','routine'] as const
export type CaptureType = typeof CAPTURE_TYPES[number]

export const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  task:       { label: 'Task',       color: '#e8ab5e', bg: '#2a2117', icon: '○' },
  idea:       { label: 'Idea',       color: '#bb87fc', bg: '#231b33', icon: '◇' },
  assertion:  { label: 'Assertion',  color: '#4ea8db', bg: '#162832', icon: '●' },
  reflection: { label: 'Reflection', color: '#e07eb4', bg: '#2d1a28', icon: '◆' },
  reference:  { label: 'Reference',  color: '#8b9ab0', bg: '#1e2128', icon: '→' },
  concept:    { label: 'Concept',    color: '#6bc9a0', bg: '#1a2d25', icon: '△' },
  routine:    { label: 'Routine',    color: '#d4636c', bg: '#2d1a1e', icon: '↻' },
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
