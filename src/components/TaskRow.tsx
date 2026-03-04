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
  assignee,
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
      className="block w-full rounded-sm hover:bg-secondary"
    >
      <div className="flex items-center gap-2.5 h-10 px-2">
        <PriorityDiamond priority={priority} />

        {/* Title */}
        <span className={cn(
          'flex-1 min-w-0 truncate text-sm font-semibold',
          done ? 'text-muted-foreground' : 'text-foreground',
        )}>
          {title}
        </span>

        {/* Assignee */}
        {assignee && (
          <span className="hidden md:inline-block text-right text-xs text-muted-foreground shrink-0 truncate max-w-[130px]">
            {assignee}
          </span>
        )}
      </div>
    </Link>
  )
}
