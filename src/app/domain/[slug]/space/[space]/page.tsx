import { prisma } from '@/lib/prisma'
import { TYPE_CONFIG, DOMAIN_CONFIG } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SpacePage({
  params,
}: {
  params: Promise<{ slug: string; space: string }>
}) {
  const { slug, space: spaceSlug } = await params

  const space = await prisma.space.findFirst({
    where: { slug: spaceSlug, domain: { slug } },
    include: {
      domain: true,
      captures: {
        orderBy: { createdAt: 'desc' },
        where: { parentId: null },
      },
    },
  })

  if (!space) notFound()

  const dc = DOMAIN_CONFIG[slug]
  const all = space.captures
  const open = all.filter(c => c.status === 'open')

  // Group by type — only active (open) items
  const byType: Record<string, typeof all> = {}
  open.forEach(c => {
    byType[c.type] = byType[c.type] || []
    byType[c.type].push(c)
  })

  const typeOrder = ['tarea', 'idea', 'fact', 'referencia']

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
        <Link href="/" className="transition-opacity hover:opacity-70">Inicio</Link>
        <span>›</span>
        <Link href={`/domain/${slug}`}
          className="transition-opacity hover:opacity-70" style={{ color: dc?.color }}>
          {space.domain.name}
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="text-[22px] font-semibold tracking-tight capitalize mb-1">{space.name}</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            {all.length} capturas
          </span>
          {open.length > 0 && (
            <span className="text-[12px]" style={{ color: 'var(--accent)' }}>
              {open.length} abiertas
            </span>
          )}
          {typeOrder.map(type => {
            const items = byType[type]
            if (!items?.length) return null
            const tc = TYPE_CONFIG[type]
            return (
              <span key={type} className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                {items.length} {tc?.label?.toLowerCase() || type}
              </span>
            )
          })}
        </div>
      </div>

      {/* Captures by type */}
      {typeOrder.map(type => {
        const items = byType[type]
        if (!items?.length) return null
        const tc = TYPE_CONFIG[type]
        return (
          <div key={type} className="mb-8">
            <h2 className="text-[11px] font-medium uppercase tracking-widest mb-3"
              style={{ color: 'var(--text-tertiary)' }}>
              {tc?.label || type}
            </h2>
            <div>
              {items.map(c => {
                const isDone = c.status === 'done' || c.status === 'completed'
                const isOpen = c.status === 'open'
                return (
                  <Link key={c.id} href={`/captures/${c.id}`}
                    className="group flex items-start gap-3 px-1 py-2.5 transition-colors hover:bg-[var(--surface)]"
                    style={{ borderBottom: '1px solid var(--border)' }}>
                    <span className="text-[13px] mt-0.5 shrink-0 leading-none"
                      style={{ color: isDone ? 'var(--text-tertiary)' : (tc?.color || 'var(--text-tertiary)') }}>
                      {tc?.icon || '·'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] truncate"
                        style={{
                          color: isDone ? 'var(--text-tertiary)' : 'var(--text)',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}>
                        {c.title || c.body}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {isOpen && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(107, 201, 160, 0.12)', color: '#6bc9a0' }}>
                            abierta
                          </span>
                        )}
                        {isDone && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)' }}>
                            completada
                          </span>
                        )}
                        {c.deadline && (
                          <span className="text-[11px]" style={{ color: 'var(--accent)' }}>
                            {new Date(c.deadline).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        {c.tags?.slice(0, 3).map((tag: string) => (
                          <span key={tag} className="text-[11px] px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)' }}>
                            {tag}
                          </span>
                        ))}
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

      {all.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>Espacio vacío</p>
          <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            Captura algo con el botón +
          </p>
        </div>
      )}
    </div>
  )
}
