import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import TaskRow from '@/components/TaskRow'

export const dynamic = 'force-dynamic'

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ space?: string; q?: string; status?: string }> }) {
  const sp = await searchParams
  const statusFilter = sp.status || 'open'

  const where: Record<string, unknown> = {}
  if (sp.space) where.space = { slug: sp.space }
  if (statusFilter !== 'all') where.status = statusFilter === 'done' ? 'done' : 'open'
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
        <span className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>Tareas</span>
        <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{tasks.length}</span>
      </div>

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <TabLink href={baseHref({ status: 'open' })} active={statusFilter === 'open'}>Abiertas</TabLink>
          <TabLink href={baseHref({ status: 'done' })} active={statusFilter === 'done'}>Completadas</TabLink>
          <TabLink href={baseHref({ status: 'all' })} active={statusFilter === 'all'}>Todas</TabLink>
        </div>
        <form className="flex items-center gap-2">
          <input name="q" defaultValue={sp.q || ''} placeholder="Buscar..."
            className="h-7 px-2 rounded-md text-xs outline-none w-40"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <select name="space" defaultValue={sp.space || ''}
            className="h-7 px-2 rounded-md text-xs"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <option value="">Todos</option>
            {spaces.map(s => <option key={s.slug} value={s.slug}>{s.domain.name} / {s.name}</option>)}
          </select>
          <input type="hidden" name="status" value={statusFilter} />
          <button type="submit"
            className="h-7 px-3 rounded-md text-[11px] font-medium border-none cursor-pointer"
            style={{ background: 'var(--accent)', color: '#0a0a0a' }}>
            Filtrar
          </button>
        </form>
      </div>

      <div>
        {tasks.map(t => (
          <TaskRow
            key={t.id}
            id={t.id}
            title={t.title || t.body}
            done={t.status === 'done'}
            assignee={t.assignee}
            date={t.createdAt}
            type={t.type}
            tags={t.tags}
            deadline={t.deadline}
            spaceColor={t.space.color || t.space.domain.color}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Sin tareas</p>
        </div>
      )}
    </div>
  )
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="px-3 py-1 rounded-md text-xs no-underline"
      style={{
        background: active ? 'var(--surface-hover)' : undefined,
        color: active ? 'var(--text)' : 'var(--text-tertiary)',
        fontWeight: active ? 500 : 400,
      }}>
      {children}
    </Link>
  )
}
