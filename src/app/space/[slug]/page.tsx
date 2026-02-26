import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function SpacePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const space = await prisma.space.findFirst({
    where: { slug },
    include: {
      domain: true,
      tasks: { orderBy: { createdAt: 'desc' } },
      _count: { select: { contacts: true, documents: true } },
    },
  })

  if (!space) notFound()

  const color = space.color || space.domain.color
  const openTasks = space.tasks.filter(t => t.status === 'open')
  const doneTasks = space.tasks.filter(t => t.status === 'done')

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-10 max-w-full">
      <div className="flex items-center gap-2 mb-4 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
        <Link href="/" className="transition-opacity hover:opacity-70">Inicio</Link>
        <span>›</span>
        <span style={{ color: space.domain.color }}>{space.domain.name}</span>
      </div>

      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
        <h1 className="text-[26px] md:text-[22px] font-semibold tracking-tight">{space.name}</h1>
      </div>
      <div className="flex items-center gap-4 mb-6 mt-1" style={{ color: 'var(--text-tertiary)' }}>
        <span className="text-[12px]" style={{ color: 'var(--accent)' }}>{openTasks.length} abiertas</span>
        {doneTasks.length > 0 && <span className="text-[12px]">{doneTasks.length} completadas</span>}
        {space._count.contacts > 0 && <span className="text-[12px]">{space._count.contacts} contactos</span>}
        {space._count.documents > 0 && <span className="text-[12px]">{space._count.documents} documentos</span>}
      </div>

      <div className="mb-8">
        {openTasks.map(t => (
          <Link key={t.id} href={`/task/${t.id}`}
            className="group flex items-start gap-3 px-2 py-3 rounded-md transition-colors hover:bg-[var(--surface)]"
            style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="w-1 shrink-0 rounded-full self-stretch mt-0.5" style={{ background: color, opacity: 0.6 }} />
            <div className="flex-1 min-w-0">
              <p className="text-[15px] md:text-[14px] leading-snug" style={{ color: 'var(--text)' }}>
                {t.title || t.body}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {t.type !== 'normal' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(232,171,94,0.12)', color: 'var(--accent)' }}>
                    {t.type}
                  </span>
                )}
                {t.assignee && (
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    → {t.assignee}
                  </span>
                )}
                {t.deadline && (
                  <span className="text-[11px]" style={{ color: 'var(--accent)' }}>
                    {new Date(t.deadline).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                {t.tags?.slice(0, 3).map((tag: string) => (
                  <span key={tag} className="text-[11px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-[11px] shrink-0 mt-0.5 ml-3" style={{ color: 'var(--text-tertiary)' }}>
              {t.createdAt.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
            </span>
          </Link>
        ))}
      </div>

      {doneTasks.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-tertiary)' }}>
            Completadas ({doneTasks.length})
          </p>
          {doneTasks.map(t => (
            <Link key={t.id} href={`/task/${t.id}`}
              className="group flex items-start gap-3 px-2 py-2 rounded-md transition-colors hover:bg-[var(--surface)]"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="w-1 shrink-0 rounded-full self-stretch mt-0.5" style={{ background: color, opacity: 0.2 }} />
              <p className="text-[14px] flex-1 leading-snug" style={{ color: 'var(--text-tertiary)' }}>
                {t.title || t.body}
              </p>
            </Link>
          ))}
        </div>
      )}

      {space.tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>Sin tareas</p>
        </div>
      )}
    </div>
  )
}
