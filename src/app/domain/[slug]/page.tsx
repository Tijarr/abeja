import { prisma } from '@/lib/prisma'
import { TYPE_CONFIG, DOMAIN_CONFIG } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const domain = await prisma.domain.findUnique({
    where: { slug },
    include: {
      spaces: {
        include: {
          captures: { orderBy: { createdAt: 'desc' } }
        }
      }
    },
  })

  if (!domain) notFound()

  const totalCaptures = domain.spaces.reduce((a, s) => a + s.captures.length, 0)
  const openCount = domain.spaces.reduce((a, s) => a + s.captures.filter(c => c.status === 'open').length, 0)
  const dc = DOMAIN_CONFIG[domain.slug]

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-10">
      {/* Header */}
      <Link href="/" className="text-[12px] mb-5 inline-flex items-center gap-1 transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-tertiary)' }}>
        ← Inicio
      </Link>

      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dc?.color || '#666' }} />
        <h1 className="text-[22px] font-semibold tracking-tight">{domain.name}</h1>
        {domain.vault && (
          <span className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)' }}>
            Privado
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-8 mt-1.5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{totalCaptures} capturas</span>
        {openCount > 0 && <span className="text-[12px]" style={{ color: 'var(--accent)' }}>{openCount} abiertas</span>}
        <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{domain.spaces.length} espacios</span>
      </div>

      {/* Spaces */}
      {domain.spaces.map(space => {
        const activeCaptures = space.captures.filter(c =>
          !c.body.startsWith('[ELIMINAD') &&
          !c.body.startsWith('[FUSIONAD') &&
          !c.body.startsWith('[MOVIDA') &&
          !c.body.startsWith('[CURADA')
        )
        if (activeCaptures.length === 0) return null
        const spaceOpen = activeCaptures.filter(c => c.status === 'open').length

        return (
          <div key={space.id} className="mb-10">
            <div className="flex items-center gap-3 mb-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <Link href={`/domain/${domain.slug}/space/${space.slug}`}
                className="text-[13px] font-medium capitalize transition-opacity hover:opacity-70">
                {space.name}
              </Link>
              <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{activeCaptures.length}</span>
              {spaceOpen > 0 && (
                <span className="text-[11px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(107, 201, 160, 0.12)', color: '#6bc9a0' }}>
                  {spaceOpen} abiertas
                </span>
              )}
            </div>

            <div>
              {activeCaptures.map(c => {
                const tc = TYPE_CONFIG[c.type]
                return (
                  <Link key={c.id} href={`/captures/${c.id}`}
                    className="group flex items-start gap-3 px-1 py-2.5 transition-colors hover:bg-[var(--surface)]"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-[13px] mt-0.5 shrink-0 leading-none" style={{ color: tc?.color || 'var(--text-tertiary)' }}>
                      {tc?.icon || '·'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] truncate"
                        style={{ color: c.status === 'done' ? 'var(--text-tertiary)' : 'var(--text)' }}>
                        {c.title || c.body}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: tc?.bg, color: tc?.color }}>
                          {tc?.label || c.type}
                        </span>
                        {c.status === 'open' && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(107, 201, 160, 0.12)', color: '#6bc9a0' }}>
                            abierta
                          </span>
                        )}
                        {c.deadline && (
                          <span className="text-[11px]" style={{ color: 'var(--accent)' }}>
                            {new Date(c.deadline).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {c.capRef && (
                          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{c.capRef}</span>
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
      })}
    </div>
  )
}
