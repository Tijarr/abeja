import { prisma } from '@/lib/prisma'
import { TYPE_CONFIG, DOMAIN_CONFIG } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TabView from '@/components/TabView'

export const dynamic = 'force-dynamic'

export default async function DomainPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const domain = await prisma.domain.findUnique({
    where: { slug },
    include: {
      spaces: {
        include: {
          captures: {
            where: { status: 'open' },
            orderBy: { createdAt: 'desc' },
          }
        }
      }
    },
  })

  if (!domain) notFound()

  const dc = DOMAIN_CONFIG[domain.slug]
  const allCaptures = domain.spaces.flatMap(s => s.captures.map(c => ({ ...c, space: s })))
  const tasks = allCaptures.filter(c => c.type === 'tarea')
  const context = allCaptures.filter(c => c.type !== 'tarea')

  const renderList = (items: typeof allCaptures) => (
    <div>
      {domain.spaces.map(space => {
        const spaceItems = items.filter(c => c.space.id === space.id)
        if (!spaceItems.length) return null
        return (
          <div key={space.id} className="mb-6">
            <Link href={`/domain/${slug}/space/${space.slug}`}
              className="text-[11px] font-medium uppercase tracking-widest mb-2 inline-flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-tertiary)' }}>
              {space.name}
              <span style={{ color: 'var(--accent)' }}>{spaceItems.length}</span>
            </Link>
            <div>
              {spaceItems.map(c => {
                const tc = TYPE_CONFIG[c.type]
                return (
                  <Link key={c.id} href={`/captures/${c.id}`}
                    className="group flex items-start gap-3 px-1 py-2.5 transition-colors hover:bg-[var(--surface)]"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-[13px] mt-0.5 shrink-0" style={{ color: tc?.color || 'var(--text-tertiary)' }}>
                      {tc?.icon || '·'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] md:text-[13px] truncate" style={{ color: 'var(--text)' }}>
                        {c.title || c.body}
                      </p>
                      {c.deadline && (
                        <span className="text-[11px] mt-0.5 block" style={{ color: 'var(--accent)' }}>
                          {new Date(c.deadline).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
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
      {items.length === 0 && (
        <p className="text-[13px] py-8 text-center" style={{ color: 'var(--text-tertiary)' }}>
          Sin elementos
        </p>
      )}
    </div>
  )

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-10 max-w-full">
      {/* Header */}
      <Link href="/" className="text-[12px] mb-4 inline-flex items-center gap-1 transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-tertiary)' }}>
        ← Inicio
      </Link>
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: dc?.color || '#666' }} />
        <h1 className="text-[20px] md:text-[22px] font-semibold tracking-tight">{domain.name}</h1>
        {domain.vault && (
          <span className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)' }}>
            Privado
          </span>
        )}
      </div>
      <div className="flex items-center gap-4 mb-6 mt-1" style={{ color: 'var(--text-tertiary)' }}>
        <span className="text-[12px]">{domain.spaces.length} espacios</span>
        <span className="text-[12px]" style={{ color: 'var(--accent)' }}>{tasks.length} tareas</span>
        {context.length > 0 && <span className="text-[12px]">{context.length} contexto</span>}
      </div>

      <TabView
        tareasCount={tasks.length}
        contextoCount={context.length}
        tareas={renderList(tasks)}
        contexto={renderList(context)}
      />
    </div>
  )
}
