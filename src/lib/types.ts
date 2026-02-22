export const CAPTURE_TYPES = ['task','idea','assertion','reflection','reference','concept','routine'] as const
export type CaptureType = typeof CAPTURE_TYPES[number]

export const TYPE_CONFIG: Record<string, { emoji: string; color: string; bg: string }> = {
  task:       { emoji: '✅', color: '#4caf50', bg: '#1a3a1a' },
  idea:       { emoji: '💡', color: '#ffc107', bg: '#3a3a1a' },
  assertion:  { emoji: '📌', color: '#2196f3', bg: '#1a2a3a' },
  reflection: { emoji: '🔒', color: '#9c27b0', bg: '#2a1a3a' },
  reference:  { emoji: '🔗', color: '#ff9800', bg: '#3a2a1a' },
  concept:    { emoji: '🧩', color: '#00bcd4', bg: '#1a3a3a' },
  routine:    { emoji: '🔄', color: '#e91e63', bg: '#3a1a2a' },
}

export const DOMAIN_EMOJI: Record<string, string> = {
  finca: '🐄', vecino: '📰', canticuento: '📖', personal: '🧠',
  familia: '👨‍👩‍👧‍👦', abeja: '🐝', sandbox: '📦',
}
