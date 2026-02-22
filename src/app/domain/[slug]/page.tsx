import { prisma } from '@/lib/prisma'
import { TYPE_CONFIG, DOMAIN_EMOJI } from '@/lib/types'
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/" className="text-[#888] hover:text-[#f5c518] text-sm mb-4 inline-block">← Volver</Link>
      
      <h1 className="text-2xl font-bold mb-1">
        {DOMAIN_EMOJI[domain.slug] || '📁'} {domain.name}
        {domain.vault && ' 🔒'}
        <span className="ml-3 text-sm font-normal px-3 py-1 rounded-full" style={{ background: '#222', color: '#f5c518' }}>
          {totalCaptures}
        </span>
      </h1>
      <p className="text-[#888] text-sm mb-8">Domain</p>

      {domain.spaces.map(space => (
        <div key={space.id} className="mb-8">
          <h2 className="text-lg font-semibold mb-3 text-[#aaa]">
            {space.name}
            <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ background: '#222', color: '#f5c518' }}>
              {space.captures.length}
            </span>
            <span className="ml-2 text-xs text-[#666]">{space.mode}</span>
          </h2>
          
          <div className="space-y-2">
            {space.captures.map(c => (
              <div key={c.id} className="bg-[#111] border border-[#222] rounded-lg px-4 py-3 flex items-start gap-3">
                <span className="text-lg shrink-0">{TYPE_CONFIG[c.type]?.emoji || '📝'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{c.content}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ 
                      background: TYPE_CONFIG[c.type]?.bg || '#222', 
                      color: TYPE_CONFIG[c.type]?.color || '#888' 
                    }}>
                      {c.type}
                    </span>
                    {c.status && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#1a3a1a', color: '#4caf50' }}>
                        {c.status}
                      </span>
                    )}
                    {c.confidence && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#1a2a3a', color: '#64b5f6' }}>
                        {c.confidence}
                      </span>
                    )}
                    {c.frequency && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#3a1a2a', color: '#e91e63' }}>
                        🔄 {c.frequency}
                      </span>
                    )}
                    {c.deadline && (
                      <span className="text-xs text-[#ff9800]">
                        📅 {new Date(c.deadline).toLocaleDateString('es-CO')}
                      </span>
                    )}
                    <span className="text-xs text-[#666]">{c.createdAt.toLocaleDateString('es-CO')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
