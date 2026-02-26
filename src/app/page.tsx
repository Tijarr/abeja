import { prisma } from '@/lib/prisma'
import Link from 'next/link'

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
  const totalTasks = await prisma.task.count()

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-10 max-w-full">
      <div className="mb-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="text-[26px] md:text-[22px] font-semibold tracking-tight mb-1">Tareas</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[12px]" style={{ color: 'var(--accent)' }}>{totalOpen} abiertas</span>
          <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{totalTasks} totales</span>
        </div>
      </div>

      {domains.map(domain => {
        const domainTasks = domain.spaces.flatMap(s => s.tasks)
        if (domainTasks.length === 0) return null

        return (
          <div key={domain.id} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full" style={{ background: domain.color }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: domain.color }}>
                {domain.name}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                {domainTasks.length}
              </span>
            </div>

            {domain.spaces.filter(s => s.tasks.length > 0).map(space => {
              const color = space.color || domain.color
              return (
                <div key={space.id} className="mb-4 ml-2">
                  <Link href={`/space/${space.slug}`}
                    className="flex items-center gap-2 mb-2 transition-opacity hover:opacity-70">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-[11px] font-medium" style={{ color }}>
                      {space.name}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      {space.tasks.length}
                    </span>
                  </Link>
                  <div>
                    {space.tasks.map(t => (
                      <Link key={t.id} href={`/task/${t.id}`}
                        className="group flex items-start gap-3 px-2 py-3 rounded-md transition-colors hover:bg-[var(--surface)]"
                        style={{ borderBottom: '1px solid var(--border)' }}>
                        <div className="w-1 shrink-0 rounded-full self-stretch mt-0.5" style={{ background: color, opacity: 0.6 }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[15px] md:text-[14px] leading-snug" style={{ color: 'var(--text)' }}>
                            {t.title || t.body}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {t.type !== 'normal' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded"
                                style={{ background: 'rgba(232,171,94,0.12)', color: 'var(--accent)' }}>
                                {t.type}
                              </span>
                            )}
                            {t.assignee && (
                              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                                → {t.assignee}
                              </span>
                            )}
                            {t.deadline && (
                              <span className="text-[11px]" style={{ color: 'var(--accent)' }}>
                                {new Date(t.deadline).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] shrink-0 mt-0.5 ml-3" style={{ color: 'var(--text-tertiary)' }}>
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
          <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>Sin tareas abiertas</p>
        </div>
      )}
    </div>
  )
}
