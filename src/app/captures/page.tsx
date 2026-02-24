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
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-10">
      <Link href="/" className="text-[12px] mb-5 inline-flex items-center gap-1 transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-tertiary)' }}>← Inicio</Link>

      <h1 className="text-[22px] font-semibold tracking-tight mb-6">
        Capturas <span style={{ color: 'var(--text-tertiary)' }}>({captures.length})</span>
      </h1>

      {/* Filtros */}
      <form className="flex gap-2 flex-wrap mb-8 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <input name="q" defaultValue={sp.q || ''} placeholder="Buscar..."
          className="px-3 py-1.5 rounded-md text-[13px] outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        <select name="type" defaultValue={sp.type || ''}
          className="px-3 py-1.5 rounded-md text-[13px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          <option value="">Todos los tipos</option>
          {Object.entries(TYPE_CONFIG).map(([t, cfg]) => <option key={t} value={t}>{cfg.label}</option>)}
        </select>
        <select name="domain" defaultValue={sp.domain || ''}
          className="px-3 py-1.5 rounded-md text-[13px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          <option value="">Todos los dominios</option>
          {domains.map(d => <option key={d.slug} value={d.slug}>{d.name}</option>)}
        </select>
        <button type="submit" className="px-3 py-1.5 rounded-md text-[13px] font-medium transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent)', color: '#0a0a0a' }}>
          Filtrar
        </button>
      </form>

      {/* Lista */}
      <div>
        {captures.map(c => {
          const tc = TYPE_CONFIG[c.type]
          const dc = DOMAIN_CONFIG[c.space.domain.slug]
          return (
            <Link key={c.id} href={`/captures/${c.id}`}
              className="group flex items-start gap-3 px-1 py-2.5 transition-colors hover:bg-[var(--surface)]"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-[13px] mt-0.5 shrink-0 leading-none" style={{ color: tc?.color || 'var(--text-tertiary)' }}>
                {tc?.icon || '·'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] truncate" style={{ color: 'var(--text)' }}>{c.title || c.body}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: tc?.bg, color: tc?.color }}>
                    {tc?.label || c.type}
                  </span>
                  <span className="text-[11px]" style={{ color: dc?.color || 'var(--text-tertiary)' }}>{c.space.domain.name}</span>
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{c.space.name}</span>
                  {c.status === 'open' && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(107, 201, 160, 0.12)', color: '#6bc9a0' }}>abierta</span>
                  )}
                </div>
              </div>
              <span className="text-[11px] shrink-0 mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {c.createdAt.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
