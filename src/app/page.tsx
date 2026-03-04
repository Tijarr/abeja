import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import TaskRow from '@/components/TaskRow'
import { cn } from '@/lib/utils'
import { MoreHorizontal, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const activeTab = tab || 'active'

  const statusMap: Record<string, string> = {
    active: 'active',
    delegated: 'delegated',
    done: 'done',
  }
  const statusFilter = statusMap[activeTab] || 'active'

  const [tasks, activeCt, delegatedCt, doneCt] = await Promise.all([
    prisma.task.findMany({
      where: { status: statusFilter },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.task.count({ where: { status: 'active' } }),
    prisma.task.count({ where: { status: 'delegated' } }),
    prisma.task.count({ where: { status: 'done' } }),
  ])

  const tabLabel: Record<string, string> = {
    active: 'Activas',
    delegated: 'Delegadas',
    done: 'Finalizadas',
  }

  return (
    <div className="px-4 md:px-8 pb-10">
      {/* Header */}
      <div className="h-[52px] flex items-center gap-2">
        <span className="text-[15px] font-semibold text-foreground">Inbox</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-3" role="tablist" aria-label="Filtrar por estado">
        <TabLink href="/" active={activeTab === 'active'}>Activas ({activeCt})</TabLink>
        <TabLink href="/?tab=delegated" active={activeTab === 'delegated'}>Delegadas ({delegatedCt})</TabLink>
        <TabLink href="/?tab=done" active={activeTab === 'done'}>Finalizadas ({doneCt})</TabLink>
      </div>

      {/* Section subheader */}
      <div className="flex items-center gap-2 mb-2 py-1">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" aria-label="Opciones">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        <span className="text-[13px] font-medium text-muted-foreground">
          Tareas {tabLabel[activeTab] || 'Activas'}
        </span>
        <span className="text-[13px] text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      {/* Task list */}
      <div>
        {tasks.map(t => (
          <TaskRow
            key={t.id}
            id={t.id}
            title={t.title || t.body}
            priority={t.priority}
            createdAt={t.createdAt}
            assignee={t.assignee}
            deadline={t.deadline}
            done={t.status === 'done'}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[13px] text-muted-foreground">
            Sin tareas {(tabLabel[activeTab] || 'activas').toLowerCase()}
          </p>
          <p className="text-[11px] mt-1 text-muted-foreground">
            Usa ⌘K para crear una nueva tarea
          </p>
        </div>
      )}
    </div>
  )
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}
      role="tab"
      aria-selected={active}
      className={cn(
        'text-[13px]',
        active ? 'text-foreground font-medium' : 'text-muted-foreground',
      )}>
      {children}
    </Link>
  )
}
