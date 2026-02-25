import { prisma } from '@/lib/prisma'
import { SPACE_CONFIG } from '@/lib/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [tasks, totalTasks] = await Promise.all([
    prisma.task.findMany({
      where: { status: 'open' },
      include: { space: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.task.count(),
  ])

  const bySpace: Record<string, { space: typeof tasks[number]['space']; tasks: typeof tasks }> = {}
  for (const t of tasks) {
    if (!bySpace[t.space.slug]) bySpace[t.space.slug] = { space: t.space, tasks: [] }
    bySpace[t.space.slug].tasks.push(t)
  }

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-10 max-w-full">
      <div className="mb-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="text-[26px] md:text-[22px] font-semibold tracking-tight mb-1">Tareas</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[12px]" style={{ color: 'var(--accent)' }}>{tasks.length} abiertas</span>
          <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{totalTasks} totales</span>
        </div>
      </div>

      {Object.values(bySpace).map(({ space, tasks: spaceTasks }) => {
        const sc = SPACE_CONFIG[space.slug]
        const color = space.color || sc?.color || '#888'
        return (
          <div key={space.slug} className="mb-6">
            <Link href={`/space/${space.slug}`}
              className="flex items-center gap-2 mb-3 transition-opacity hover:opacity-70">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color }}>
                {space.name}
              </span>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                {spaceTasks.length}
              </span>
            </Link>
            <div>
              {spaceTasks.map(t => (
                <Link key={t.id} href={`/task/${t.id}`}
                  className="group flex items-start gap-3 px-2 py-3 rounded-md transition-colors hover:bg-[var(--surface)]"
                  style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="w-1 shrink-0 rounded-full self-stretch mt-0.5" style={{ background: color, opacity: 0.6 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] md:text-[14px] leading-snug" style={{ color: 'var(--text)' }}>
                      {t.title || t.body}
                    </p>
                    {t.deadline && (
                      <span className="text-[11px] mt-1 inline-block" style={{ color: 'var(--accent)' }}>
                        {new Date(t.deadline).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
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

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>Sin tareas abiertas</p>
        </div>
      )}
    </div>
  )
}
