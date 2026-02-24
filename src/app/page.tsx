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
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[22px] font-semibold tracking-tight mb-1">Abeja</h1>
        <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>Context designer</p>
      </div>

      {/* Stats row */}
      <div className="flex gap-6 mb-10 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <StatBlock num={totalCaptures} label="Captures" />
        <StatBlock num={openTasks} label="Open tasks" accent />
        <StatBlock num={domains.length} label="Domains" />
        {Object.entries(typeCounts).sort((a,b) => b[1]-a[1]).slice(0, 4).map(([type, count]) => (
          <StatBlock key={type} num={count} label={TYPE_CONFIG[type]?.label || type} />
        ))}
      </div>

      {/* Domains list */}
      <div className="mb-10">
        <h2 className="text-[11px] font-medium uppercase tracking-widest mb-3" style={{ color: 'var(--text-tertiary)' }}>
          Domains
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
                        Private
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
                    <div className="text-[11px]" style={{ color: 'var(--accent)' }}>{openCount} open</div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="text-[13px] font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text-tertiary)' }}>
          Recent activity
        </h2>
        <div className="space-y-px">
          {recentCaptures.map(c => {
            const tc = TYPE_CONFIG[c.type]
            const dc = DOMAIN_CONFIG[c.space.domain.slug]
            return (
              <div key={c.id} className="flex items-start gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-[var(--surface)]">
                <span className="text-[14px] mt-0.5 shrink-0 w-4 text-center font-mono" style={{ color: tc?.color || '#666' }}>
                  {tc?.icon || '·'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] leading-relaxed" style={{ color: c.status === 'done' ? 'var(--text-tertiary)' : 'var(--text)' }}>
                    {c.title || c.body}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: tc?.bg, color: tc?.color }}>
                      {tc?.label || c.type}
                    </span>
                    <span className="text-[11px]" style={{ color: dc?.color || '#666' }}>
                      {c.space.domain.name}
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      {c.space.name}
                    </span>
                    {c.status === 'open' && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: '#1f2a1a', color: '#6bc9a0' }}>
                        open
                      </span>
                    )}
                    {c.deadline && (
                      <span className="text-[11px]" style={{ color: '#e8ab5e' }}>
                        {new Date(c.deadline).toLocaleDateString('es-CO')}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[11px] shrink-0 mt-1" style={{ color: 'var(--text-tertiary)' }}>
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

function StatBlock({ num, label, accent }: { num: number; label: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[24px] font-semibold tracking-tight" style={{ color: accent ? 'var(--accent)' : 'var(--text)' }}>
        {num}
      </div>
      <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{label}</div>
    </div>
  )
}
