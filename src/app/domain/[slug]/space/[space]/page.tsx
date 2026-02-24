import { prisma } from '@/lib/prisma'
import { DOMAIN_CONFIG } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const TASK_TYPES = ['tarea']
const IDEA_TYPES = ['idea']
const FACT_TYPES = ['fact']
const REF_TYPES  = ['referencia']

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d}d`
  return `${Math.floor(d / 30)}mo`
}

function truncate(str: string, n: number) {
  return str.length > n ? str.slice(0, n) + '…' : str
}

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

  const all   = space.captures
  const tasks = all.filter(c => TASK_TYPES.includes(c.type))
  const ideas = all.filter(c => IDEA_TYPES.includes(c.type))
  const facts = all.filter(c => FACT_TYPES.includes(c.type))
  const refs  = all.filter(c => REF_TYPES.includes(c.type))

  const dc = DOMAIN_CONFIG[slug]
  const domainColor = dc?.color || 'var(--text-tertiary)'

  return (
    <div className="px-6 py-8 max-w-4xl">

      {/* Breadcrumb */}
      <Link
        href={`/domain/${slug}`}
        className="text-[12px] mb-5 inline-flex items-center gap-1.5 transition-colors hover:opacity-80"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <span className="w-1.5 h-1.5 rounded-sm shrink-0" style={{ background: domainColor }} />
        {space.domain.name}
      </Link>

      {/* Header */}
      <div className="mb-8" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '20px' }}>
        <h1 className="text-[22px] font-semibold tracking-tight mb-2 capitalize"
          style={{ color: 'var(--text)' }}>
          {space.name}
        </h1>

        {/* Métricas inline */}
        <div className="flex items-center gap-3 flex-wrap">
          {tasks.length > 0 && (
            <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              {tasks.length} tareas
            </span>
          )}
          {ideas.length > 0 && (
            <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              {ideas.length} ideas
            </span>
          )}
          {facts.length > 0 && (
            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              📝 {facts.length} facts
            </span>
          )}
          {refs.length > 0 && (
            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              {refs.length} refs
            </span>
          )}
          {all.length === 0 && (
            <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              Espacio vacío
            </span>
          )}
        </div>
      </div>

      {/* ── TAREAS ─────────────────────────────────── */}
      {tasks.length > 0 && (
        <section className="mb-10">
          <p className="text-[11px] font-medium uppercase tracking-wider mb-2 px-4"
            style={{ color: 'var(--text-tertiary)' }}>
            Tareas
          </p>
          <div>
            {tasks.map(t => {
              const done = t.status === 'done' || t.status === 'completed' || !!t.completedAt
              const label = t.title || truncate(t.body, 80)
              return (
                <div
                  key={t.id}
                  className="flex items-start gap-3 px-4 py-2.5 group cursor-pointer transition-colors hover:bg-[var(--surface)]"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  {/* Estado */}
                  <span className="mt-0.5 shrink-0 text-[13px]"
                    style={{ color: done ? '#6bc9a0' : 'var(--accent)' }}>
                    {done ? '✓' : '○'}
                  </span>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] leading-snug"
                      style={{
                        color: done ? 'var(--text-tertiary)' : 'var(--text)',
                        textDecoration: done ? 'line-through' : 'none',
                      }}>
                      {label}
                    </p>
                    {t.tags?.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {t.tags.slice(0, 4).map(tag => (
                          <span key={tag}
                            className="text-[10px] px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--surface)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fecha + hover actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                      {timeAgo(new Date(t.createdAt))}
                    </span>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button className="p-1 rounded transition-colors hover:bg-[var(--border)]"
                        style={{ color: 'var(--text-secondary)' }}
                        title="Completar">
                        ✓
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── IDEAS ──────────────────────────────────── */}
      {ideas.length > 0 && (
        <section className="mb-10">
          <p className="text-[11px] font-medium uppercase tracking-wider mb-3 px-4"
            style={{ color: 'var(--text-tertiary)' }}>
            Ideas
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 px-4">
            {ideas.map(idea => (
              <div
                key={idea.id}
                className="rounded-lg p-3 cursor-pointer transition-colors hover:bg-[var(--surface-hover)]"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  minHeight: '72px',
                }}
              >
                <p className="text-[13px] leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}>
                  {truncate(idea.body, 120)}
                </p>
                {idea.tags?.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {idea.tags.slice(0, 3).map(tag => (
                      <span key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--border)', color: 'var(--text-tertiary)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── REFERENCIAS ────────────────────────────── */}
      {refs.length > 0 && (
        <section className="mb-10">
          <p className="text-[11px] font-medium uppercase tracking-wider mb-2 px-4"
            style={{ color: 'var(--text-tertiary)' }}>
            Referencias
          </p>
          <div>
            {refs.map(ref => {
              const isPerson = ref.metadata && typeof ref.metadata === 'object' &&
                (ref.metadata as Record<string, unknown>)?.subtype === 'persona'
              const label = ref.title || truncate(ref.body, 60)
              return (
                <div key={ref.id}
                  className="flex items-center gap-3 px-4 py-2.5 group cursor-pointer transition-colors hover:bg-[var(--surface)]"
                  style={{ borderBottom: '1px solid var(--border)' }}
                >
                  <span className="text-[13px] shrink-0"
                    style={{ color: 'var(--text-tertiary)' }}>
                    {isPerson ? '👤' : '📄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] truncate"
                      style={{ color: 'var(--text)' }}>
                      {label}
                    </p>
                    {ref.sourceUrl && (
                      <p className="text-[11px] truncate"
                        style={{ color: 'var(--text-tertiary)' }}>
                        {ref.sourceUrl}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] shrink-0"
                    style={{ color: 'var(--text-tertiary)' }}>
                    {timeAgo(new Date(ref.createdAt))}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Vacío */}
      {all.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            Este espacio está vacío
          </p>
          <p className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
            Captura algo desde Telegram o desde el botón +
          </p>
        </div>
      )}
    </div>
  )
}
