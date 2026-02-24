import { prisma } from '@/lib/prisma'
import { TYPE_CONFIG, DOMAIN_CONFIG } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function CapturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = parseInt(id, 10)
  if (isNaN(numId)) notFound()

  const capture = await prisma.capture.findUnique({
    where: { id: numId },
    include: { space: { include: { domain: true } } },
  })

  if (!capture) notFound()

  const tc = TYPE_CONFIG[capture.type]
  const dc = DOMAIN_CONFIG[capture.space.domain.slug]

  const isOpen = capture.status === 'open'
  const isDone = capture.status === 'done'

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-16 max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
        <Link href="/" className="transition-opacity hover:opacity-70">Inicio</Link>
        <span>›</span>
        <Link href={`/domain/${capture.space.domain.slug}`}
          className="transition-opacity hover:opacity-70" style={{ color: dc?.color }}>
          {capture.space.domain.name}
        </Link>
        <span>›</span>
        <Link href={`/domain/${capture.space.domain.slug}/space/${capture.space.slug}`}
          className="transition-opacity hover:opacity-70">
          {capture.space.name}
        </Link>
      </div>

      {/* Status + type badges */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-[12px] px-2 py-1 rounded"
          style={{ background: tc?.bg, color: tc?.color }}>
          {tc?.icon} {tc?.label || capture.type}
        </span>
        {isOpen && (
          <span className="text-[12px] px-2 py-1 rounded"
            style={{ background: 'rgba(107, 201, 160, 0.12)', color: '#6bc9a0' }}>
            abierta
          </span>
        )}
        {isDone && (
          <span className="text-[12px] px-2 py-1 rounded"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)' }}>
            completada
          </span>
        )}
        {capture.capRef && (
          <span className="text-[11px] ml-auto tabular-nums" style={{ color: 'var(--text-tertiary)' }}>
            {capture.capRef}
          </span>
        )}
      </div>

      {/* Title */}
      {capture.title && capture.title !== capture.body?.slice(0, 80) && (
        <h1 className="text-[20px] md:text-[22px] font-semibold tracking-tight mb-4 leading-snug">
          {capture.title}
        </h1>
      )}

      {/* Body */}
      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <p className="text-[14px] leading-relaxed whitespace-pre-wrap"
          style={{ color: isDone ? 'var(--text-secondary)' : 'var(--text)' }}>
          {capture.body}
        </p>
      </div>

      {/* Metadata */}
      <div className="space-y-3">
        <MetaRow label="Dominio">
          <Link href={`/domain/${capture.space.domain.slug}`}
            className="transition-opacity hover:opacity-70"
            style={{ color: dc?.color }}>
            {capture.space.domain.name}
          </Link>
        </MetaRow>

        <MetaRow label="Espacio">
          <Link href={`/domain/${capture.space.domain.slug}/space/${capture.space.slug}`}
            className="transition-opacity hover:opacity-70"
            style={{ color: 'var(--text-secondary)' }}>
            {capture.space.name}
          </Link>
        </MetaRow>

        <MetaRow label="Creado">
          <span style={{ color: 'var(--text-secondary)' }}>
            {capture.createdAt.toLocaleDateString('es-CO', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </span>
        </MetaRow>

        {capture.deadline && (
          <MetaRow label="Fecha límite">
            <span style={{ color: 'var(--accent)' }}>
              {new Date(capture.deadline).toLocaleDateString('es-CO', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </span>
          </MetaRow>
        )}

        {capture.confidence && (
          <MetaRow label="Confianza">
            <span style={{ color: 'var(--text-secondary)' }}>{capture.confidence}</span>
          </MetaRow>
        )}

        {capture.frequency && (
          <MetaRow label="Frecuencia">
            <span style={{ color: 'var(--text-secondary)' }}>↻ {capture.frequency}</span>
          </MetaRow>
        )}

        {capture.sourceUrl && (
          <MetaRow label="Fuente">
            <a href={capture.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="truncate block transition-opacity hover:opacity-70 max-w-[240px] md:max-w-none"
              style={{ color: 'var(--accent)' }}>
              {capture.sourceUrl}
            </a>
          </MetaRow>
        )}

        {capture.tags && capture.tags.length > 0 && (
          <MetaRow label="Tags">
            <div className="flex flex-wrap gap-1.5">
              {capture.tags.map((tag: string) => (
                <span key={tag} className="text-[11px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-tertiary)' }}>
                  {tag}
                </span>
              ))}
            </div>
          </MetaRow>
        )}
      </div>
    </div>
  )
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="text-[12px] shrink-0 w-24 pt-0.5" style={{ color: 'var(--text-tertiary)' }}>
        {label}
      </span>
      <div className="text-[13px] flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
