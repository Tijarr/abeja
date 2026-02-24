import { prisma } from '@/lib/prisma'
import { TYPE_CONFIG, DOMAIN_CONFIG } from '@/lib/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [tasks, totalOpen, totalCaptures] = await Promise.all([
    prisma.capture.findMany({
      where: { status: 'open', type: 'tarea' },
      include: { space: { include: { domain: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.capture.count({ where: { status: 'open' } }),
    prisma.capture.count(),
  ])

  // Group by domain
  const byDomain: Record<string, { domain: any; spaces: Record<string, { space: any; tasks: typeof tasks }> }> = {}
  for (const t of tasks) {
    const dslug = t.space.domain.slug
    if (!byDomain[dslug]) byDomain[dslug] = { domain: t.space.domain, spaces: {} }
    const sslug = t.space.slug
    if (!byDomain[dslug].spaces[sslug]) byDomain[dslug].spaces[sslug] = { space: t.space, tasks: [] }
    byDomain[dslug].spaces[sslug].tasks.push(t)
  }

  const tc = TYPE_CONFIG['tarea']

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-10 max-w-full">
      {/* Header */}
      <div className="mb-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="text-[20px] md:text-[22px] font-semibold tracking-tight mb-1">Tareas</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[12px]" style={{ color: 'var(--accent)' }}>{tasks.length} abiertas</span>
          <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{totalCaptures} capturas totales</span>
        </div>
      </div>

      {/* Tasks by domain */}
      {Object.values(byDomain).map(({ domain, spaces }) => {
        const dc = DOMAIN_CONFIG[domain.slug]
        return (
          <div key={domain.slug} className="mb-8">
            {/* Domain header */}
            <Link href={`/domain/${domain.slug}`}
              className="flex items-center gap-2 mb-3 transition-opacity hover:opacity-70">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dc?.color || '#888' }} />
              <span className="text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: dc?.color || 'var(--text-tertiary)' }}>
                {domain.name}
              </span>
            </Link>

            {Object.values(spaces).map(({ space, tasks: spaceTasks }) => (
              <div key={space.slug} className="mb-5 ml-4">
                {/* Space label */}
                <Link href={`/domain/${domain.slug}/space/${space.slug}`}
                  className="text-[11px] mb-2 inline-flex items-center gap-1 transition-opacity hover:opacity-70"
                  style={{ color: 'var(--text-tertiary)' }}>
                  {space.name}
                  <span>·</span>
                  <span style={{ color: 'var(--accent)' }}>{spaceTasks.length}</span>
                </Link>
                <div>
                  {spaceTasks.map(t => (
                    <Link key={t.id} href={`/captures/${t.id}`}
                      className="group flex items-start gap-3 px-1 py-2.5 transition-colors hover:bg-[var(--surface)]"
                      style={{ borderBottom: '1px solid var(--border)' }}>
                      <span className="text-[13px] mt-0.5 shrink-0" style={{ color: tc?.color || 'var(--text-tertiary)' }}>
                        {tc?.icon || '○'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] md:text-[13px] truncate" style={{ color: 'var(--text)' }}>
                          {t.title || t.body}
                        </p>
                        {t.deadline && (
                          <span className="text-[11px] mt-0.5 block" style={{ color: 'var(--accent)' }}>
                            {new Date(t.deadline).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] shrink-0 mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                        {t.createdAt.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
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
