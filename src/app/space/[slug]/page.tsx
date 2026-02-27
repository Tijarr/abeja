import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { resolveSlug } from '@/lib/slug-redirect'
import Link from 'next/link'
import TaskRow from '@/components/TaskRow'

export const dynamic = 'force-dynamic'

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
  const total = space.tasks.length
  const pctDone = total > 0 ? Math.round((doneTasks.length / total) * 100) : 0
  const visibleTasks = activeTab === 'done' ? doneTasks : openTasks

  return (
    <div className="px-4 md:px-8 pb-10">
      <div className="h-[52px] flex items-center gap-2.5">
        <svg width="16" height="16" viewBox="0 0 14 14" fill="none" className="shrink-0">
          <path d="M7 1.5L12 4.25V9.75L7 12.5L2 9.75V4.25L7 1.5Z" stroke={color} strokeWidth="1" strokeLinejoin="round" />
        </svg>
        <span className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>{space.name}</span>
        <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{openTasks.length}</span>
      </div>

      <div className="flex items-center gap-2 mb-3 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
        <Link href="/" className="no-underline opacity-70" style={{ color: 'inherit' }}>Inicio</Link>
        <span>/</span>
        <span style={{ color: space.domain.color }}>{space.domain.name}</span>
        <span>/</span>
        <span style={{ color }}>{space.name}</span>
        {space._count.contacts > 0 && <span className="ml-2">{space._count.contacts} contactos</span>}
        {space._count.documents > 0 && <span>{space._count.documents} docs</span>}
      </div>

      {space.description && (
        <p className="text-[12px] mb-3" style={{ color: 'var(--text-tertiary)' }}>{space.description}</p>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
          <span>{openTasks.length} abiertas</span>
          <span>·</span>
          <span>{doneTasks.length} hechas</span>
          <span>·</span>
          <span>{pctDone}%</span>
        </div>
        <div style={{
          flex: 1,
          height: '3px',
          background: 'var(--border)',
          borderRadius: '2px',
          overflow: 'hidden',
          maxWidth: '120px',
        }}>
          <div style={{
            width: `${pctDone}%`,
            height: '100%',
            background: 'var(--accent)',
            borderRadius: '2px',
            transition: 'width 0.3s',
          }} />
        </div>
      </div>

      <div className="flex items-center gap-1 mb-3">
        <Link href={`/space/${slug}`}
          className="px-3 py-1 rounded-md text-xs no-underline"
          style={{
            background: activeTab === 'open' ? 'var(--surface-hover)' : undefined,
            color: activeTab === 'open' ? 'var(--text)' : 'var(--text-tertiary)',
            fontWeight: activeTab === 'open' ? 500 : 400,
          }}>
          Abiertas <span className="font-mono">{openTasks.length}</span>
        </Link>
        <Link href={`/space/${slug}?tab=done`}
          className="px-3 py-1 rounded-md text-xs no-underline"
          style={{
            background: activeTab === 'done' ? 'var(--surface-hover)' : undefined,
            color: activeTab === 'done' ? 'var(--text)' : 'var(--text-tertiary)',
            fontWeight: activeTab === 'done' ? 500 : 400,
          }}>
          Completadas <span className="font-mono">{doneTasks.length}</span>
        </Link>
      </div>

      <div>
        {visibleTasks.map(t => (
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
            spaceColor={color}
          />
        ))}
      </div>

      {visibleTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
            {activeTab === 'done' ? 'Sin tareas completadas' : 'Sin tareas abiertas'}
          </p>
          {activeTab !== 'done' && (
            <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
              Usa + Nueva tarea para crear una
            </p>
          )}
        </div>
      )}
    </div>
  )
}
