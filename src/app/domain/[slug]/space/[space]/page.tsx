import { prisma } from '@/lib/prisma'
import { DOMAIN_CONFIG } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const TASK_TYPES = ['task', 'tarea', 'routine']
const IDEA_TYPES = ['idea', 'concept']
const FACT_TYPES = ['assertion', 'fact', 'creencia', 'regla', 'reflexion']
const REF_TYPES  = ['reference', 'referencia']

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
        where: { parentId: null }, // solo nivel raíz por ahora
      },
    },
  })

  if (!space) notFound()

  const all      = space.captures
  const tasks    = all.filter(c => TASK_TYPES.includes(c.type))
  const ideas    = all.filter(c => IDEA_TYPES.includes(c.type))
  const facts    = all.filter(c => FACT_TYPES.includes(c.type))
  const refs     = all.filter(c => REF_TYPES.includes(c.type))

  const dc = DOMAIN_CONFIG[slug]
  const domainColor = dc?.color || '#888'

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Breadcrumb */}
      <Link
        href={`/domain/${slug}`}
        className="text-[13px] mb-5 inline-flex items-center gap-1 transition-colors hover:opacity-80"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <span style={{ color: domainColor }}>●</span> {space.domain.name}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[26px] font-semibold tracking-tight mb-3 capitalize">
          {space.name}
        </h1>

        {/* Métricas */}
        <div className="flex flex-wrap gap-2">
          {tasks.length > 0 && (
            <span className="text-[12px] px-2.5 py-1 rounded-full"
              style={{ background: '#2a2117', color: '#e8ab5e' }}>
              {tasks.length} tareas
            </span>
          )}
          {ideas.length > 0 && (
            <span className="text-[12px] px-2.5 py-1 rounded-full"
              style={{ background: '#231b33', color: '#bb87fc' }}>
              {ideas.length} ideas
            </span>
          )}
          {facts.length > 0 && (
            <span className="text-[12px] px-2.5 py-1 rounded-full"
              style={{ background: '#162832', color: '#4ea8db' }}>
              📝 {facts.length} facts
            </span>
          )}
          {refs.length > 0 && (
            <span className="text-[12px] px-2.5 py-1 rounded-full"
              style={{ background: '#1e2128', color: '#8b9ab0' }}>
              {refs.length} refs
            </span>
          )}
          {all.length === 0 && (
            <span className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
              Espacio vacío
            </span>
          )}
        </div>
      </div>

      {/* ── TAREAS ──────────────────────────────────── */}
      {tasks.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[13px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#e8ab5e' }}>
            Tareas
          </h2>
          <div className="space-y-1">
            {tasks.map(t => {
              const done = t.status === 'done' || t.status === 'completed' || !!t.completedAt
              const label = t.title || truncate(t.body, 80)
              return (
                <div
                  key={t.id}
                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg group cursor-pointer transition-colors hover:bg-[var(--surface-hover)]"
                >
                  <span className="mt-0.5 shrink-0 text-[15px]"
                    style={{ color: done ? '#6bc9a0' : '#e8ab5e' }}>
                    {done ? '✓' : '○'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] leading-snug"
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
                            style={{ background: 'var(--surface)', color: 'var(--text-tertiary)' }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[11px] shrink-0 mt-0.5"
                    style={{ color: 'var(--text-tertiary)' }}>
                    {timeAgo(new Date(t.createdAt))}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── IDEAS ───────────────────────────────────── */}
      {ideas.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[13px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#bb87fc' }}>
            Ideas
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ideas.map(idea => (
              <div
                key={idea.id}
                className="rounded-lg p-3 cursor-pointer transition-all hover:scale-[1.01]"
                style={{
                  background: '#1a1526',
                  border: '1px solid #2d2040',
                  minHeight: '80px',
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
                        style={{ background: '#231b33', color: '#9b72d0' }}>
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

      {/* ── REFERENCIAS ─────────────────────────────── */}
      {refs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[13px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: '#8b9ab0' }}>
            Referencias
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {refs.map(ref => {
              const isPerson = ref.metadata && typeof ref.metadata === 'object' &&
                (ref.metadata as Record<string, unknown>)?.subtype === 'persona'
              const icon = isPerson ? '👤' : '📄'
              const label = ref.title || truncate(ref.body, 60)
              return (
                <div key={ref.id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors hover:bg-[var(--surface-hover)]"
                >
                  <span className="text-[14px]">{icon}</span>
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
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Vacío total */}
      {all.length === 0 && (
        <div className="text-center py-20"
          style={{ color: 'var(--text-tertiary)' }}>
          <p className="text-[14px]">Este espacio está vacío</p>
          <p className="text-[12px] mt-1">Captura algo desde Telegram o desde el botón +</p>
        </div>
      )}
    </div>
  )
}
