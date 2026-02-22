import { prisma } from '@/lib/prisma'
import { TYPE_CONFIG, DOMAIN_EMOJI } from '@/lib/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CapturesPage({ searchParams }: { searchParams: Promise<{ type?: string; domain?: string; q?: string }> }) {
  const sp = await searchParams
  
  const where: Record<string, unknown> = {}
  if (sp.type) where.type = sp.type
  if (sp.domain) where.space = { domain: { slug: sp.domain } }
  if (sp.q) where.content = { contains: sp.q }

  const captures = await prisma.capture.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { space: { include: { domain: true } } },
    take: 200,
  })

  const domains = await prisma.domain.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/" className="text-[#888] hover:text-[#f5c518] text-sm mb-4 inline-block">← Volver</Link>
      <h1 className="text-2xl font-bold mb-6" style={{ color: '#f5c518' }}>Capturas ({captures.length})</h1>

      {/* Filters */}
      <form className="flex gap-3 flex-wrap mb-6">
        <input name="q" defaultValue={sp.q || ''} placeholder="Buscar..."
          className="bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#666] focus:outline-none focus:border-[#f5c518]" />
        <select name="type" defaultValue={sp.type || ''}
          className="bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white">
          <option value="">Todos los tipos</option>
          {Object.keys(TYPE_CONFIG).map(t => <option key={t} value={t}>{TYPE_CONFIG[t].emoji} {t}</option>)}
        </select>
        <select name="domain" defaultValue={sp.domain || ''}
          className="bg-[#111] border border-[#333] rounded-lg px-3 py-2 text-sm text-white">
          <option value="">Todos los domains</option>
          {domains.map(d => <option key={d.slug} value={d.slug}>{DOMAIN_EMOJI[d.slug]} {d.name}</option>)}
        </select>
        <button type="submit" className="bg-[#f5c518] text-black text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#e0b015]">
          Filtrar
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        {captures.map(c => (
          <div key={c.id} className="bg-[#111] border border-[#222] rounded-lg px-4 py-3 flex items-start gap-3">
            <span className="text-lg shrink-0">{TYPE_CONFIG[c.type]?.emoji || '📝'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm">{c.content}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded" style={{ background: TYPE_CONFIG[c.type]?.bg, color: TYPE_CONFIG[c.type]?.color }}>
                  {c.type}
                </span>
                <span className="text-xs text-[#666]">
                  {DOMAIN_EMOJI[c.space.domain.slug]} {c.space.domain.name}/{c.space.name}
                </span>
                {c.status && <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#1a3a1a', color: '#4caf50' }}>{c.status}</span>}
                <span className="text-xs text-[#666]">{c.createdAt.toLocaleDateString('es-CO')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
