import Link from 'next/link'

function StatusIcon({ done }: { done: boolean }) {
  if (done) return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 7l2 2 3-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/)
  const text = parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
  return (
    <span style={{
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 20,
      height: 20,
      borderRadius: '50%',
      fontSize: '9px',
      fontWeight: 500,
      background: 'rgba(200,241,53,0.1)',
      color: 'var(--accent)',
    }}>
      {text}
    </span>
  )
}

function TypeBadge({ type }: { type: string }) {
  if (!type || type === 'normal') return null
  return (
    <span style={{
      flexShrink: 0,
      fontSize: '10px',
      padding: '1px 5px',
      borderRadius: '3px',
      background: 'rgba(200,241,53,0.1)',
      color: 'var(--accent)',
      textTransform: 'uppercase',
      fontWeight: 500,
      letterSpacing: '0.02em',
    }}>
      {type}
    </span>
  )
}

function TagPills({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return null
  const visible = tags.slice(0, 2)
  const extra = tags.length - 2
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
      {visible.map(tag => (
        <span key={tag} style={{
          fontSize: '10px',
          padding: '0 4px',
          borderRadius: '2px',
          background: 'rgba(255,255,255,0.05)',
          color: 'var(--text-tertiary)',
          whiteSpace: 'nowrap',
        }}>
          {tag}
        </span>
      ))}
      {extra > 0 && (
        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>+{extra}</span>
      )}
    </span>
  )
}

function getDateColor(done: boolean, deadline?: Date | null): string {
  if (done) return 'var(--text-tertiary)'
  if (!deadline) return 'var(--text-tertiary)'
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dl = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())
  if (dl < today) return '#d4636c'
  if (dl.getTime() === today.getTime()) return 'var(--accent)'
  return 'var(--text-tertiary)'
}

export default function TaskRow({
  id,
  title,
  done = false,
  assignee,
  date,
  type,
  tags,
  deadline,
  spaceColor,
}: {
  id: number
  title: string
  done?: boolean
  assignee?: string | null
  date: Date
  type?: string
  tags?: string[]
  deadline?: Date | null
  spaceColor?: string
}) {
  const displayDate = deadline || date
  const dateColor = getDateColor(done, deadline)

  return (
    <Link
      href={`/task/${id}`}
      className="hover:bg-[var(--surface-hover)]"
      style={{ display: 'block', width: '100%', textDecoration: 'none', color: 'inherit', borderRadius: '2px' }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        height: '40px',
        padding: '0 8px',
        boxSizing: 'border-box',
        borderLeft: spaceColor ? `2px solid ${spaceColor}` : '2px solid transparent',
      }}>
        <StatusIcon done={done} />
        <TypeBadge type={type || ''} />
        <div style={{ flex: '1 1 0%', minWidth: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '14px',
            color: done ? 'var(--text-tertiary)' : 'var(--text)',
            minWidth: 0,
            flex: '1 1 0%',
          }}>
            {title}
          </span>
          <TagPills tags={tags || []} />
        </div>
        <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {assignee && <Initials name={assignee} />}
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            color: dateColor,
            flexShrink: 0,
            fontWeight: deadline && !done ? 500 : 400,
          }}>
            {displayDate.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
          </span>
        </span>
      </div>
    </Link>
  )
}
