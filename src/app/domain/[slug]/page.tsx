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
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <Link href="/" className="text-[13px] mb-6 inline-flex items-center gap-1 transition-colors"
        style={{ color: 'var(--text-tertiary)' }}
      >
        ← Back
      </Link>
      
      <div className="flex items-center gap-3 mb-1">
        <div className="w-3 h-3 rounded-full" style={{ background: dc?.color || '#666' }} />
        <h1 className="text-[22px] font-semibold tracking-tight">{domain.name}</h1>
        {domain.vault && <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: 'var(--surface)', color: 'var(--text-tertiary)' }}>Private</span>}
      </div>
      
      <div className="flex gap-4 mb-8 mt-2 pb-8" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{totalCaptures} captures</span>
        {openCount > 0 && <span className="text-[13px]" style={{ color: 'var(--accent)' }}>{openCount} open</span>}
        <span className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{domain.spaces.length} spaces</span>
      </div>

      {/* Spaces */}
      {domain.spaces.map(space => {
        const activeCaptures = space.captures.filter(c => !c.body.startsWith('[ELIMINAD') && !c.body.startsWith('[FUSIONAD') && !c.body.startsWith('[MOVIDA') && !c.body.startsWith('[CURADA'))
        if (activeCaptures.length === 0) return null
        const spaceOpen = activeCaptures.filter(c => c.status === 'open').length
        
        return (
          <div key={space.id} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-[15px] font-medium capitalize">{space.name}</h2>
              <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{activeCaptures.length}</span>
              {spaceOpen > 0 && <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: '#1f2a1a', color: '#6bc9a0' }}>{spaceOpen} open</span>}
            </div>
            
            <div className="space-y-px">
              {activeCaptures.map(c => {
                const tc = TYPE_CONFIG[c.type]
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
                        {c.status === 'open' && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: '#1f2a1a', color: '#6bc9a0' }}>
                            open
                          </span>
                        )}
                        {c.status === 'done' && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface)', color: 'var(--text-tertiary)' }}>
                            done
                          </span>
                        )}
                        {c.confidence && (
                          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                            {c.confidence}
                          </span>
                        )}
                        {c.frequency && (
                          <span className="text-[11px]" style={{ color: '#d4636c' }}>
                            ↻ {c.frequency}
                          </span>
                        )}
                        {c.deadline && (
                          <span className="text-[11px]" style={{ color: '#e8ab5e' }}>
                            {new Date(c.deadline).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                          {c.capRef}
                        </span>
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
      })}
    </div>
  )
}
