import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import TaskRow from '@/components/TaskRow'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const domains = await prisma.domain.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      spaces: {
        orderBy: { sortOrder: 'asc' },
        include: {
          tasks: {
            where: { status: 'open' },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  })

  const totalOpen = domains.reduce((sum, d) =>
    sum + d.spaces.reduce((s, sp) => s + sp.tasks.length, 0), 0)

  return (
    <div className="px-4 md:px-8 pb-10">
      <div className="h-[52px] flex items-center gap-2.5">
        <span className="text-[15px] font-semibold" style={{ color: 'var(--text)' }}>Tareas</span>
        <span className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>{totalOpen}</span>
      </div>

      <form action="/tasks" method="GET" className="mb-4">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          padding: '0 10px',
          maxWidth: '320px',
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}>
            <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            name="q"
            type="text"
            placeholder="Buscar tareas..."
            style={{
              flex: 1,
              height: '32px',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '13px',
              color: 'var(--text)',
            }}
          />
        </div>
      </form>

      {domains.map(domain => {
        const domainTasks = domain.spaces.flatMap(s => s.tasks)
        if (domainTasks.length === 0) return null

        return (
          <div key={domain.id} className="mb-4">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: 'var(--surface)',
              borderRadius: '6px',
              marginBottom: '8px',
            }}>
              <span className="shrink-0 rounded-full" style={{ width: 7, height: 7, background: domain.color }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                {domain.name}
              </span>
              <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                {domainTasks.length}
              </span>
            </div>

            {domain.spaces.filter(s => s.tasks.length > 0).map(space => {
              const color = space.color || domain.color
              return (
                <div key={space.id} className="mb-2">
                  <Link href={`/space/${space.slug}`}
                    className="flex items-center gap-2 h-7 pl-6 no-underline">
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" className="shrink-0">
                      <path d="M7 1.5L12 4.25V9.75L7 12.5L2 9.75V4.25L7 1.5Z" stroke={color} strokeWidth="1" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {space.name}
                    </span>
                    <span className="text-[11px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
                      {space.tasks.length}
                    </span>
                  </Link>

                  <div className="pl-4">
                    {space.tasks.map(t => (
                      <TaskRow
                        key={t.id}
                        id={t.id}
                        title={t.title || t.body}
                        assignee={t.assignee}
                        date={t.createdAt}
                        type={t.type}
                        tags={t.tags}
                        deadline={t.deadline}
                        spaceColor={color}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}

      {totalOpen === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Sin tareas abiertas</p>
          <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>Crea una para comenzar</p>
        </div>
      )}
    </div>
  )
}
