import { prisma } from '@/lib/prisma'
import { TYPE_CONFIG, DOMAIN_EMOJI } from '@/lib/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const domains = await prisma.domain.findMany({
    include: { spaces: { include: { captures: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  const totalCaptures = domains.reduce((acc, d) => acc + d.spaces.reduce((a, s) => a + s.captures.length, 0), 0)
  
  const typeCounts: Record<string, number> = {}
  domains.forEach(d => d.spaces.forEach(s => s.captures.forEach(c => {
    typeCounts[c.type] = (typeCounts[c.type] || 0) + 1
  })))

  const recentCaptures = await prisma.capture.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { space: { include: { domain: true } } },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-1" style={{ color: '#f5c518' }}>🐝 Abeja</h1>
      <p className="text-[#888] mb-8 text-sm">Sistema de captura y contexto — Angel Tijaro</p>

      {/* Stats */}
      <div className="flex gap-3 flex-wrap mb-8">
        <Stat num={totalCaptures} label="Total" />
        {Object.entries(typeCounts).sort((a,b) => b[1]-a[1]).map(([type, count]) => (
          <Stat key={type} num={count} label={type} emoji={TYPE_CONFIG[type]?.emoji} />
        ))}
      </div>

      {/* Domains */}
      <div className="grid gap-4 mb-10">
        {domains.map(domain => {
          const count = domain.spaces.reduce((a, s) => a + s.captures.length, 0)
          if (count === 0) return null
          return (
            <Link key={domain.id} href={`/domain/${domain.slug}`}
              className="bg-[#111] border border-[#222] rounded-xl p-5 hover:border-[#444] transition">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {DOMAIN_EMOJI[domain.slug] || '📁'} {domain.name}
                  {domain.vault && ' 🔒'}
                </h2>
                <span className="text-sm px-3 py-1 rounded-full" style={{ background: '#222', color: '#f5c518' }}>
                  {count}
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {domain.spaces.map(s => (
                  <span key={s.id} className="text-xs text-[#666]">
                    {s.name} ({s.captures.length})
                  </span>
                ))}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Recent */}
      <h2 className="text-lg font-semibold mb-4">Recientes</h2>
      <div className="space-y-2">
        {recentCaptures.map(c => (
          <div key={c.id} className="bg-[#111] border border-[#222] rounded-lg px-4 py-3 flex items-start gap-3">
            <span className="text-lg">{TYPE_CONFIG[c.type]?.emoji || '📝'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{c.content}</p>
              <p className="text-xs text-[#666] mt-1">
                {DOMAIN_EMOJI[c.space.domain.slug]} {c.space.domain.name} / {c.space.name}
                <span className="ml-2">{c.createdAt.toLocaleDateString('es-CO')}</span>
              </p>
            </div>
            {c.status && (
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#1a3a1a', color: '#4caf50' }}>
                {c.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function Stat({ num, label, emoji }: { num: number; label: string; emoji?: string }) {
  return (
    <div className="bg-[#111] border border-[#222] rounded-lg px-4 py-3">
      <div className="text-2xl font-bold" style={{ color: '#f5c518' }}>{num}</div>
      <div className="text-xs text-[#888] uppercase">{emoji} {label}</div>
    </div>
  )
}
