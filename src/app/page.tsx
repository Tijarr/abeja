import { prisma } from '@/lib/prisma'
import { TYPE_CONFIG, DOMAIN_CONFIG } from '@/lib/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const domains = await prisma.domain.findMany({
    include: { spaces: { include: { captures: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  const totalCaptures = domains.reduce((acc, d) => acc + d.spaces.reduce((a, s) => a + s.captures.length, 0), 0)
  const openTasks = domains.reduce((acc, d) => acc + d.spaces.reduce((a, s) => a + s.captures.filter(c => c.type === 'tarea' && c.status === 'open').length, 0), 0)

  const typeCounts: Record<string, number> = {}
  domains.forEach(d => d.spaces.forEach(s => s.captures.forEach(c => {
    typeCounts[c.type] = (typeCounts[c.type] || 0) + 1
  })))

  const recentCaptures = await prisma.capture.findMany({
    take: 15,
    orderBy: { createdAt: 'desc' },
    include: { space: { include: { domain: true } } },
  })

  return (
    <div className="px-8 pt-6 pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold tracking-tight mb-0.5">Abeja</h1>
        <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Context engine</p>
      </div>

      {/* Stats — compact inline */}
      <div className="flex items-center gap-6 mb-8 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <StatItem num={totalCaptures} label="capturas" />
        <StatItem num={openTasks} label="tareas abiertas" accent />
        <StatItem num={domains.length} label="dominios" />
        {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([type, count]) => (
          <StatItem key={type} num={count} label={TYPE_CONFIG[type]?.label?.toLowerCase() || type} />
        ))}
      </div>

      {/* Domains */}
      <div className="mb-8">
        <h2 className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Dominios
        </h2>
        <div>
          {domains.map(domain => {
            const count = domain.spaces.reduce((a, s) => a + s.captures.length, 0)
            if (count === 0) return null
            const config = DOMAIN_CONFIG[domain.slug]
            const openCount = domain.spaces.reduce((a, s) => a + s.captures.filter(c => c.status === 'open').length, 0)
            return (
              <Link key={domain.id} href={`/domain/${domain.slug}`}
                className="group flex items-center gap-3 px-1 py-2.5 transition-colors hover:bg-[var(--surface)]"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: config?.color || '#666' }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px]">{domain.name}</span>
                    {domain.vault && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)' }}>
                        Privado
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {domain.spaces.map(s => s.name).join(' · ')}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{count}</span>
                  {openCount > 0 && (
                    <div className="text-[11px]" style={{ color: 'var(--accent)' }}>{openCount} abiertas</div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Actividad reciente */}
      <div>
        <h2 className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Actividad reciente
        </h2>
        <div>
          {recentCaptures.map(c => {
            const tc = TYPE_CONFIG[c.type]
            const dc = DOMAIN_CONFIG[c.space.domain.slug]
            return (
              <div key={c.id} className="group flex items-start gap-3 px-1 py-2.5 transition-colors hover:bg-[var(--surface)]"
                style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-[13px] mt-0.5 shrink-0 leading-none" style={{ color: tc?.color || 'var(--text-tertiary)' }}>
                  {tc?.icon || '·'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] truncate"
                    style={{ color: c.status === 'done' ? 'var(--text-tertiary)' : 'var(--text)' }}>
                    {c.title || c.body}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: tc?.bg, color: tc?.color }}>
                      {tc?.label || c.type}
                    </span>
                    <span className="text-[11px]" style={{ color: dc?.color || 'var(--text-tertiary)' }}>
                      {c.space.domain.name}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      {c.space.name}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] shrink-0 mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                  {c.createdAt.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatItem({ num, label, accent }: { num: number; label: string; accent?: boolean }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-[18px] font-medium tabular-nums tracking-tight"
        style={{ color: accent ? 'var(--accent)' : 'var(--text)' }}>
        {num}
      </span>
      <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
    </div>
  )
}
