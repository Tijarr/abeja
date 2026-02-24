import { prisma } from '@/lib/prisma'
import { TYPE_CONFIG, DOMAIN_CONFIG } from '@/lib/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CapturesPage({ searchParams }: { searchParams: Promise<{ type?: string; domain?: string; q?: string }> }) {
  const sp = await searchParams
  
  const where: Record<string, unknown> = {}
  if (sp.type) where.type = sp.type
  if (sp.domain) where.space = { domain: { slug: sp.domain } }
  if (sp.q) where.OR = [{ body: { contains: sp.q, mode: 'insensitive' } }, { title: { contains: sp.q, mode: 'insensitive' } }]

  const captures = await prisma.capture.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { space: { include: { domain: true } } },
    take: 200,
  })

  const domains = await prisma.domain.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Link href="/" className="text-[13px] mb-6 inline-flex items-center gap-1 transition-colors"
        style={{ color: 'var(--text-tertiary)' }}>← Back</Link>
      
      <h1 className="text-[22px] font-semibold tracking-tight mb-6">Captures <span style={{ color: 'var(--text-tertiary)' }}>({captures.length})</span></h1>

      {/* Filters */}
      <form className="flex gap-3 flex-wrap mb-8 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <input name="q" defaultValue={sp.q || ''} placeholder="Search..."
          className="px-3 py-2 rounded-lg text-[13px] outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        <select name="type" defaultValue={sp.type || ''}
          className="px-3 py-2 rounded-lg text-[13px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          <option value="">All types</option>
          {Object.entries(TYPE_CONFIG).map(([t, cfg]) => <option key={t} value={t}>{cfg.icon} {cfg.label}</option>)}
        </select>
        <select name="domain" defaultValue={sp.domain || ''}
          className="px-3 py-2 rounded-lg text-[13px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          <option value="">All domains</option>
          {domains.map(d => <option key={d.slug} value={d.slug}>{d.name}</option>)}
        </select>
        <button type="submit" className="px-4 py-2 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}>
          Filter
        </button>
      </form>

      {/* List */}
      <div className="space-y-px">
        {captures.map(c => {
          const tc = TYPE_CONFIG[c.type]
          const dc = DOMAIN_CONFIG[c.space.domain.slug]
          return (
            <div key={c.id} className="flex items-start gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-[var(--surface)]">
              <span className="text-[14px] mt-0.5 shrink-0 w-4 text-center font-mono" style={{ color: tc?.color || '#666' }}>
                {tc?.icon || '·'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] leading-relaxed">{c.title || c.body}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: tc?.bg, color: tc?.color }}>
                    {tc?.label || c.type}
                  </span>
                  <span className="text-[11px]" style={{ color: dc?.color || '#666' }}>{c.space.domain.name}</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{c.space.name}</span>
                  {c.status === 'open' && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: '#1f2a1a', color: '#6bc9a0' }}>open</span>
                  )}
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{c.capRef}</span>
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
  )
}
