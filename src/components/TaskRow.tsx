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

export default function TaskRow({
  id,
  title,
  priority = 'normal',
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
  return (
    <Link
      href={`/task/${id}`}
      className="group flex items-center gap-3 w-full py-2.5 rounded-md hover:bg-secondary transition-colors"
    >
      <PriorityDiamond priority={priority} />
      <span className={cn(
        'flex-1 min-w-0 text-sm font-medium truncate',
        done ? 'text-muted-foreground' : 'text-foreground',
      )}>
        {title}
      </span>
    </Link>
  )
}
