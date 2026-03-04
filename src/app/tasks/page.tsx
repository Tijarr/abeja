import { prisma } from '@/lib/prisma'
import { TasksPageClient } from './TasksPageClient'

export const dynamic = 'force-dynamic'

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ space?: string; q?: string; status?: string }> }) {
  const sp = await searchParams
  const statusFilter = sp.status || 'active'

  const where: Record<string, unknown> = {}
  if (sp.space) where.space = { slug: sp.space }
  if (statusFilter !== 'all') {
    where.status = statusFilter === 'open' ? 'active' : statusFilter
  }
  if (sp.q) where.OR = [
    { body: { contains: sp.q, mode: 'insensitive' } },
    { title: { contains: sp.q, mode: 'insensitive' } },
  ]

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { space: { include: { domain: true } } },
    take: 200,
  })

  const spaces = await prisma.space.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { domain: { select: { name: true } } },
  })

  return (
    <TasksPageClient
      tasks={tasks}
      spaces={spaces}
      statusFilter={statusFilter}
      currentSpace={sp.space || ''}
      currentQuery={sp.q || ''}
    />
  )
}
