import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

function StatusIcon({ done }: { done: boolean }) {
  if (done) return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" style={{ color: 'var(--text-tertiary)' }}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4.5 7l2 2 3-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0" style={{ color: 'var(--text-tertiary)' }}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/)
  const letters = parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase()
  return (
    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-medium shrink-0"
      style={{ background: 'var(--accent-dim, rgba(200,241,53,0.1))', color: 'var(--accent)' }}>
      {letters}
    </span>
  )
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}
      className="px-3 py-1 rounded-md text-[12px] transition-colors"
      style={{
        background: active ? 'var(--surface-hover)' : undefined,
        color: active ? 'var(--text)' : 'var(--text-tertiary)',
        fontWeight: active ? 500 : 400,
      }}>
      {children}
    </Link>
  )
}

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
    <div className="px-4 md:px-6 pt-4 md:pt-5 pb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-[16px] font-semibold" style={{ color: 'var(--text)' }}>Tareas</h1>
          <span className="text-[12px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{tasks.length}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          <TabLink href={baseHref({ status: 'open' })} active={statusFilter === 'open'}>Abiertas</TabLink>
          <TabLink href={baseHref({ status: 'done' })} active={statusFilter === 'done'}>Completadas</TabLink>
          <TabLink href={baseHref({ status: 'all' })} active={statusFilter === 'all'}>Todas</TabLink>
        </div>
        <form className="flex items-center gap-2">
          <input name="q" defaultValue={sp.q || ''} placeholder="Buscar..."
            className="h-7 px-2 rounded-md text-[12px] outline-none w-[160px]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
          <select name="space" defaultValue={sp.space || ''}
            className="h-7 px-2 rounded-md text-[12px]"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
            <option value="">Todos</option>
            {spaces.map(s => <option key={s.slug} value={s.slug}>{s.domain.name} / {s.name}</option>)}
          </select>
          <input type="hidden" name="status" value={statusFilter} />
          <button type="submit" className="h-7 px-3 rounded-md text-[11px] font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--accent)', color: 'var(--on-accent, #0a0a0a)' }}>
            Filtrar
          </button>
        </form>
      </div>

      <div>
        {tasks.map(t => {
          const done = t.status === 'done'
          return (
            <Link key={t.id} href={`/task/${t.id}`}
              className="group flex items-center gap-2 h-9 px-2 rounded-sm transition-colors hover:bg-[var(--surface-hover)]">
              <StatusIcon done={done} />
              <span className="text-[11px] font-mono shrink-0 w-[52px]"
                style={{ color: 'var(--text-tertiary)' }}>
                ABJ-{t.id}
              </span>
              <span className="text-[13px] truncate flex-1"
                style={{ color: done ? 'var(--text-tertiary)' : 'var(--text)' }}>
                {t.title || t.body}
              </span>
              <span className="text-[10px] shrink-0 hidden md:inline"
                style={{ color: t.space.domain.color }}>
                {t.space.domain.name}
              </span>
              <span className="text-[10px] shrink-0 hidden md:inline"
                style={{ color: t.space.color || t.space.domain.color }}>
                {t.space.name}
              </span>
              {t.type !== 'normal' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0"
                  style={{ background: 'rgba(200,241,53,0.1)', color: 'var(--accent)' }}>
                  {t.type}
                </span>
              )}
              {t.assignee && <Initials name={t.assignee} />}
              <span className="text-[11px] font-mono shrink-0"
                style={{ color: 'var(--text-tertiary)' }}>
                {t.createdAt.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
              </span>
            </Link>
          )
        })}
      </div>

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Sin tareas</p>
        </div>
      )}
    </div>
  )
}
