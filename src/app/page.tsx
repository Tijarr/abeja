import { prisma } from '@/lib/prisma'
import { InboxTabs } from './InboxTabs'
import { ChevronDown } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function InboxPage() {
  const [activeTasks, delegatedTasks, doneTasks] = await Promise.all([
    prisma.task.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.task.findMany({
      where: { status: 'delegated' },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.task.findMany({
      where: { status: 'done' },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
  ])

  return (
    <div className="px-4 md:px-8 pb-10">
      {/* Header */}
      <div className="h-[52px] flex items-center gap-2">
        <span className="text-[15px] font-semibold text-foreground">Inbox</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </div>

      <InboxTabs
        active={activeTasks}
        delegated={delegatedTasks}
        done={doneTasks}
      />
    </div>
  )
}
