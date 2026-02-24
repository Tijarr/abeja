import { prisma } from '@/lib/prisma'
import { TYPE_CONFIG, DOMAIN_CONFIG } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TabView from '@/components/TabView'

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
        where: { parentId: null, status: 'open' },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!space) notFound()

  const dc = DOMAIN_CONFIG[slug]
  const tasks = space.captures.filter(c => c.type === 'tarea')
  const context = space.captures.filter(c => c.type !== 'tarea')

  const renderItems = (items: typeof space.captures) => (
    <div>
      {items.map(c => {
        const tc = TYPE_CONFIG[c.type]
        return (
          <Link key={c.id} href={`/captures/${c.id}`}
            className="group flex items-start gap-3 px-1 py-2.5 transition-colors hover:bg-[var(--surface)]"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <span className="text-[13px] mt-0.5 shrink-0 leading-none"
              style={{ color: tc?.color || 'var(--text-tertiary)' }}>
              {tc?.icon || '·'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[18px] md:text-[14px] truncate" style={{ color: 'var(--text)' }}>
                {c.title || c.body}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {c.deadline && (
                  <span className="text-[11px]" style={{ color: 'var(--accent)' }}>
                    {new Date(c.deadline).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                {c.tags?.slice(0, 2).map((tag: string) => (
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
      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>Sin elementos</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-10 max-w-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
        <Link href="/" className="transition-opacity hover:opacity-70">Inicio</Link>
        <span>›</span>
        <Link href={`/domain/${slug}`}
          className="transition-opacity hover:opacity-70" style={{ color: dc?.color }}>
          {space.domain.name}
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[26px] md:text-[22px] font-semibold tracking-tight capitalize mb-1">{space.name}</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            {space.captures.length} capturas abiertas
          </span>
          {tasks.length > 0 && (
            <span className="text-[12px]" style={{ color: 'var(--accent)' }}>{tasks.length} tareas</span>
          )}
          {context.length > 0 && (
            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>{context.length} contexto</span>
          )}
        </div>
      </div>

      <TabView
        tareasCount={tasks.length}
        contextoCount={context.length}
        tareas={renderItems(tasks)}
        contexto={renderItems(context)}
      />
    </div>
  )
}
