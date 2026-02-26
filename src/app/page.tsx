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
    <div className="px-4 md:px-6 pt-4 md:pt-5 pb-10">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-[16px] font-semibold" style={{ color: 'var(--text)' }}>Tareas</h1>
        <span className="text-[12px] font-mono" style={{ color: 'var(--text-tertiary)' }}>{totalOpen}</span>
      </div>

      {domains.map(domain => {
        const domainTasks = domain.spaces.flatMap(s => s.tasks)
        if (domainTasks.length === 0) return null

        return (
          <div key={domain.id} className="mb-5">
            <div className="flex items-center gap-2 h-7 px-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: domain.color }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--text-secondary)' }}>
                {domain.name}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                {domainTasks.length}
              </span>
            </div>

            {domain.spaces.filter(s => s.tasks.length > 0).map(space => {
              const color = space.color || domain.color
              return (
                <div key={space.id} className="mb-2">
                  <Link href={`/space/${space.slug}`}
                    className="flex items-center gap-2 h-6 px-2 pl-6 transition-opacity hover:opacity-70">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
                      <path d="M7 1.5L12 4.25V9.75L7 12.5L2 9.75V4.25L7 1.5Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
                    </svg>
                    <span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                      {space.name}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      {space.tasks.length}
                    </span>
                  </Link>

                  <div>
                    {space.tasks.map(t => (
                      <Link key={t.id} href={`/task/${t.id}`}
                        className="group flex items-start gap-2 py-2 px-2 rounded-sm transition-colors hover:bg-[var(--surface-hover)]">
                        <span className="mt-[3px] shrink-0"><StatusIcon done={false} /></span>
                        <span className="text-[13px] flex-1 min-w-0" style={{ color: 'var(--text)' }}>
                          {t.title || t.body}
                        </span>
                        {t.type !== 'normal' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0 mt-[2px]"
                            style={{ background: 'rgba(200,241,53,0.1)', color: 'var(--accent)' }}>
                            {t.type}
                          </span>
                        )}
                        {t.assignee && <span className="mt-[1px]"><Initials name={t.assignee} /></span>}
                        <span className="text-[11px] font-mono shrink-0 mt-[2px]"
                          style={{ color: 'var(--text-tertiary)' }}>
                          {t.createdAt.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                        </span>
                      </Link>
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
