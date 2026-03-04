import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PRIORITY_COLORS, type Priority } from '@/lib/types'

function PriorityDiamond({ priority }: { priority: string }) {
  const color = PRIORITY_COLORS[priority as Priority] || PRIORITY_COLORS.normal
  return (
    <span
      role="img"
      aria-label={`Prioridad: ${priority}`}
      className="inline-block w-2.5 h-2.5 shrink-0 rotate-45 rounded-[2px]"
      style={{ background: color }}
    />
  )
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' }).replace('.', '')
}

export default function TaskRow({
  id,
  title,
  priority = 'normal',
  createdAt,
  assignee,
  deadline,
  done = false,
}: {
  id: number
  title: string
  priority?: string
  createdAt: Date
  assignee?: string | null
  deadline?: Date | null
  done?: boolean
}) {
  const deadlineColor = (() => {
    if (done || !deadline) return 'text-muted-foreground'
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dl = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate())
    if (dl < today) return 'text-destructive'
    if (dl.getTime() === today.getTime()) return 'text-primary'
    return 'text-muted-foreground'
  })()

  return (
    <Link
      href={`/task/${id}`}
      className="block w-full rounded-sm hover:bg-secondary"
    >
      <div className="flex items-center gap-2.5 h-10 px-2">
        <PriorityDiamond priority={priority} />

        {/* Created date */}
        <span className="hidden md:inline-block w-[50px] text-right text-[11px] font-mono text-muted-foreground shrink-0">
          {formatDate(createdAt)}
        </span>

        {/* Vertical separator */}
        <span className="hidden md:inline-block w-px h-5 bg-border shrink-0" />

        {/* Title */}
        <span className={cn(
          'flex-1 min-w-0 truncate text-sm font-semibold',
          done ? 'text-muted-foreground' : 'text-foreground',
        )}>
          {title}
        </span>

        {/* Assignee */}
        <span className="hidden md:inline-block w-[130px] text-right text-xs text-muted-foreground shrink-0 truncate">
          {assignee || '\u2014'}
        </span>

        {/* Deadline */}
        <span className={cn(
          'w-[50px] text-right text-[11px] font-mono shrink-0',
          deadlineColor,
          deadline && !done && 'font-medium',
        )}>
          {deadline ? formatDate(deadline) : ''}
        </span>
      </div>
    </Link>
  )
}
