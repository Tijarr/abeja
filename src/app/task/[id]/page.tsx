import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TaskActions from './TaskActions'
import AddComment from './AddComment'

export const dynamic = 'force-dynamic'

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = parseInt(id, 10)
  if (isNaN(numId)) notFound()

  const task = await prisma.task.findUnique({
    where: { id: numId },
    include: {
      space: { include: { domain: true, contacts: true } },
      comments: { orderBy: { createdAt: 'asc' } },
      documents: { include: { document: true } },
    },
  })

  if (!task) notFound()

  const color = task.space.color || task.space.domain.color
  const isDone = task.status === 'done'

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-16 max-w-2xl">
      <div className="flex items-center gap-2 mb-5 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
        <Link href="/" className="transition-opacity hover:opacity-70">Inicio</Link>
        <span>›</span>
        <span style={{ color: task.space.domain.color }}>{task.space.domain.name}</span>
        <span>›</span>
        <Link href={`/space/${task.space.slug}`}
          className="transition-opacity hover:opacity-70" style={{ color }}>
          {task.space.name}
        </Link>
      </div>

      <TaskActions taskId={task.id} status={task.status || 'open'} spaceName={task.space.name} />

      {task.title && task.title !== task.body?.slice(0, 80) && (
        <h1 className="text-[20px] md:text-[22px] font-semibold tracking-tight mb-4 leading-snug">
          {task.title}
        </h1>
      )}

      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap"
          style={{ color: isDone ? 'var(--text-secondary)' : 'var(--text)' }}>
          {task.body}
        </p>
      </div>

      <div className="space-y-3 mb-8 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <MetaRow label="Dominio">
          <span style={{ color: task.space.domain.color }}>{task.space.domain.name}</span>
        </MetaRow>

        <MetaRow label="Espacio">
          <Link href={`/space/${task.space.slug}`}
            className="transition-opacity hover:opacity-70 flex items-center gap-1.5" style={{ color }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            {task.space.name}
          </Link>
        </MetaRow>

        <MetaRow label="Estado">
          <span style={{ color: isDone ? 'var(--text-tertiary)' : '#6bc9a0' }}>
            {isDone ? 'Completada' : 'Abierta'}
          </span>
        </MetaRow>

        <MetaRow label="Tipo">
          <span style={{ color: task.type !== 'normal' ? 'var(--accent)' : 'var(--text-secondary)' }}>
            {task.type}
          </span>
        </MetaRow>

        {task.assignee && (
          <MetaRow label="Responsable">
            <span style={{ color: 'var(--text-secondary)' }}>{task.assignee}</span>
          </MetaRow>
        )}

        <MetaRow label="Creada">
          <span style={{ color: 'var(--text-secondary)' }}>
            {task.createdAt.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </MetaRow>

        {task.deadline && (
          <MetaRow label="Fecha limite">
            <span style={{ color: 'var(--accent)' }}>
              {new Date(task.deadline).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </MetaRow>
        )}

        {task.completedAt && (
          <MetaRow label="Completada">
            <span style={{ color: 'var(--text-secondary)' }}>
              {task.completedAt.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </MetaRow>
        )}

        {task.tags && task.tags.length > 0 && (
          <MetaRow label="Tags">
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag: string) => (
                <span key={tag} className="text-[11px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </MetaRow>
        )}

        {task.capRef && (
          <MetaRow label="Ref">
            <span className="tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{task.capRef}</span>
          </MetaRow>
        )}
      </div>

      {/* Documents */}
      {task.documents.length > 0 && (
        <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-tertiary)' }}>
            Documentos ({task.documents.length})
          </p>
          <div className="space-y-2">
            {task.documents.map(td => (
              <div key={td.document.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{ background: 'var(--surface)' }}>
                <span className="text-[13px]" style={{ color: 'var(--text)' }}>{td.document.name}</span>
                {td.document.url && (
                  <a href={td.document.url} target="_blank" rel="noopener noreferrer"
                    className="text-[11px] ml-auto transition-opacity hover:opacity-70"
                    style={{ color: 'var(--accent)' }}>
                    Abrir
                  </a>
                )}
                {td.document.mimeType && (
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    {td.document.mimeType}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
          style={{ color: 'var(--text-tertiary)' }}>
          Comentarios {task.comments.length > 0 && `(${task.comments.length})`}
        </p>

        {task.comments.length > 0 && (
          <div className="space-y-3 mb-4">
            {task.comments.map(c => (
              <div key={c.id} className="px-3 py-3 rounded-lg" style={{ background: 'var(--surface)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {c.author}
                  </span>
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    {c.createdAt.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {c.authorType === 'agent' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(232,171,94,0.15)', color: 'var(--accent)' }}>
                      agente
                    </span>
                  )}
                </div>
                <p className="text-[13px] whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text)' }}>
                  {c.body}
                </p>
              </div>
            ))}
          </div>
        )}

        <AddComment taskId={task.id} />
      </div>

      {/* Contacts */}
      {task.space.contacts.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--text-tertiary)' }}>
            Contactos de {task.space.name} ({task.space.contacts.length})
          </p>
          <div className="space-y-2">
            {task.space.contacts.map(c => (
              <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                style={{ background: 'var(--surface)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium shrink-0"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                  {c.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px]" style={{ color: 'var(--text)' }}>{c.name}</p>
                  {c.role && <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{c.role}</p>}
                </div>
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="text-[11px] transition-opacity hover:opacity-70"
                    style={{ color: 'var(--accent)' }}>{c.phone}</a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-[12px] shrink-0 w-24 pt-0.5" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </span>
      <div className="text-[13px] flex-1 min-w-0">{children}</div>
    </div>
  )
}
