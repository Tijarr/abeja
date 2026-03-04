import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import TaskRow from '@/components/TaskRow'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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

  const baseHref = (params: Record<string, string>) => {
    const p = new URLSearchParams()
    if (params.status) p.set('status', params.status)
    if (sp.space) p.set('space', sp.space)
    if (sp.q) p.set('q', sp.q)
    const qs = p.toString()
    return `/tasks${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="px-4 md:px-8 pb-10">
      <div className="h-[52px] flex items-center gap-2.5">
        <span className="text-[15px] font-semibold text-foreground">Tareas</span>
        <span className="text-xs font-mono text-muted-foreground">{tasks.length}</span>
      </div>

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-4" role="tablist" aria-label="Filtrar por estado">
          <TabLink href={baseHref({ status: 'active' })} active={statusFilter === 'active'}>Activas</TabLink>
          <TabLink href={baseHref({ status: 'delegated' })} active={statusFilter === 'delegated'}>Delegadas</TabLink>
          <TabLink href={baseHref({ status: 'done' })} active={statusFilter === 'done'}>Finalizadas</TabLink>
          <TabLink href={baseHref({ status: 'all' })} active={statusFilter === 'all'}>Todas</TabLink>
        </div>
        <form className="flex items-center gap-2">
          <Input name="q" defaultValue={sp.q || ''} placeholder="Buscar..."
            className="h-7 w-40 text-xs" />
          <select name="space" defaultValue={sp.space || ''}
            className="h-7 px-2 rounded-md text-xs bg-card border border-border text-foreground">
            <option value="">Todos</option>
            {spaces.map(s => <option key={s.slug} value={s.slug}>{s.domain.name} / {s.name}</option>)}
          </select>
          <input type="hidden" name="status" value={statusFilter} />
          <Button type="submit" size="sm" className="h-7 text-[11px]">
            Filtrar
          </Button>
        </form>
      </div>

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
          <p className="text-[13px] text-muted-foreground">Sin tareas</p>
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
