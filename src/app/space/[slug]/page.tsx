import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { resolveSlug } from '@/lib/slug-redirect'
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

export default async function SpacePage({ params, searchParams }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { slug } = await params
  const { tab } = await searchParams
  const activeTab = tab || 'open'

  const space = await prisma.space.findFirst({
    where: { slug },
    include: {
      domain: true,
      tasks: { orderBy: { createdAt: 'desc' } },
      _count: { select: { contacts: true, documents: true } },
    },
  })

  if (!space) {
    const resolved = await resolveSlug(slug, 'space')
    if (resolved) redirect(`/space/${resolved}`)
    notFound()
  }

  const color = space.color || space.domain.color
  const openTasks = space.tasks.filter(t => t.status === 'open')
  const doneTasks = space.tasks.filter(t => t.status === 'done')
  const visibleTasks = activeTab === 'done' ? doneTasks : openTasks

  return (
    <div className="px-4 md:px-6 pt-4 md:pt-5 pb-10">
      <div className="flex items-center gap-2 mb-3 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        <Link href="/" className="transition-opacity hover:opacity-70">Inicio</Link>
        <span>/</span>
        <span style={{ color: space.domain.color }}>{space.domain.name}</span>
      </div>

      <div className="flex items-center gap-2.5 mb-1">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
        <h1 className="text-[16px] font-semibold" style={{ color: 'var(--text)' }}>{space.name}</h1>
        <span className="text-[12px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
          {openTasks.length}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        {space._count.contacts > 0 && <span>{space._count.contacts} contactos</span>}
        {space._count.documents > 0 && <span>{space._count.documents} docs</span>}
      </div>

      <div className="flex items-center gap-1 mb-3">
        <Link href={`/space/${slug}`}
          className="px-3 py-1 rounded-md text-[12px] transition-colors"
          style={{
            background: activeTab === 'open' ? 'var(--surface-hover)' : undefined,
            color: activeTab === 'open' ? 'var(--text)' : 'var(--text-tertiary)',
            fontWeight: activeTab === 'open' ? 500 : 400,
          }}>
          Abiertas <span className="font-mono">{openTasks.length}</span>
        </Link>
        <Link href={`/space/${slug}?tab=done`}
          className="px-3 py-1 rounded-md text-[12px] transition-colors"
          style={{
            background: activeTab === 'done' ? 'var(--surface-hover)' : undefined,
            color: activeTab === 'done' ? 'var(--text)' : 'var(--text-tertiary)',
            fontWeight: activeTab === 'done' ? 500 : 400,
          }}>
          Completadas <span className="font-mono">{doneTasks.length}</span>
        </Link>
      </div>

      <div>
        {visibleTasks.map(t => {
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

      {visibleTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            {activeTab === 'done' ? 'Sin tareas completadas' : 'Sin tareas abiertas'}
          </p>
        </div>
      )}
    </div>
  )
}
