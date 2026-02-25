import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ space?: string; q?: string; status?: string }> }) {
  const sp = await searchParams

  const where: Record<string, unknown> = {}
  if (sp.space) where.space = { slug: sp.space }
  if (sp.status) where.status = sp.status
  if (sp.q) where.OR = [
    { body: { contains: sp.q, mode: 'insensitive' } },
    { title: { contains: sp.q, mode: 'insensitive' } },
  ]

  const tasks = await prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { space: true },
    take: 200,
  })

  const spaces = await prisma.space.findMany({ orderBy: { sortOrder: 'asc' } })

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-10">
      <Link href="/" className="text-[12px] mb-5 inline-flex items-center gap-1 transition-opacity hover:opacity-70"
        style={{ color: 'var(--text-tertiary)' }}>← Inicio</Link>

      <h1 className="text-[22px] font-semibold tracking-tight mb-6">
        Tareas <span style={{ color: 'var(--text-tertiary)' }}>({tasks.length})</span>
      </h1>

      <form className="flex gap-2 flex-wrap mb-8 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <input name="q" defaultValue={sp.q || ''} placeholder="Buscar..."
          className="px-3 py-1.5 rounded-md text-[13px] outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }} />
        <select name="space" defaultValue={sp.space || ''}
          className="px-3 py-1.5 rounded-md text-[13px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          <option value="">Todos los espacios</option>
          {spaces.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
        <select name="status" defaultValue={sp.status || ''}
          className="px-3 py-1.5 rounded-md text-[13px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          <option value="">Todos</option>
          <option value="open">Abiertas</option>
          <option value="done">Completadas</option>
        </select>
        <button type="submit" className="px-3 py-1.5 rounded-md text-[13px] font-medium transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent)', color: '#0a0a0a' }}>
          Filtrar
        </button>
      </form>

      <div>
        {tasks.map(t => {
          const color = t.space.color || '#888'
          return (
            <Link key={t.id} href={`/task/${t.id}`}
              className="group flex items-start gap-3 px-1 py-2.5 transition-colors hover:bg-[var(--surface)]"
              style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-[13px] mt-0.5 shrink-0 leading-none"
                style={{ color: t.status === 'done' ? 'var(--text-tertiary)' : 'var(--accent)' }}>
                {t.status === 'done' ? '●' : '○'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] truncate" style={{ color: 'var(--text)' }}>{t.title || t.body}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[11px]" style={{ color }}>{t.space.name}</span>
                  {t.status === 'open' && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(107, 201, 160, 0.12)', color: '#6bc9a0' }}>abierta</span>
                  )}
                </div>
              </div>
              <span className="text-[11px] shrink-0 mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                {t.createdAt.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
