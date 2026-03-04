// Domain and space colors are now stored in the database.
export const DEFAULT_COLOR = '#8b9ab0'

// Priority system
export const PRIORITY_VALUES = ['urgent', 'high', 'normal', 'low', 'review'] as const
export type Priority = typeof PRIORITY_VALUES[number]

export const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: '#ef4444',
  high:   '#eab308',
  normal: '#3b82f6',
  low:    '#22c55e',
  review: '#a855f7',
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: 'Urgente',
  high:   'Alta',
  normal: 'Normal',
  low:    'Baja',
  review: 'Revisión',
}

export function isValidPriority(value: string): value is Priority {
  return PRIORITY_VALUES.includes(value as Priority)
}
