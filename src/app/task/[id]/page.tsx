import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import TaskActions from './TaskActions'
import AddComment from './AddComment'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

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
      <Breadcrumb className="mb-5">
        <BreadcrumbList className="text-xs">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>›</BreadcrumbSeparator>
          <BreadcrumbItem>
            <span style={{ color: task.space.domain.color }}>{task.space.domain.name}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator>›</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/space/${task.space.slug}`} style={{ color }}>
                {task.space.name}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <TaskActions taskId={task.id} status={task.status || 'active'} spaceName={task.space.name} />

      {task.title && task.title !== task.body?.slice(0, 80) && (
        <h1 className="text-[20px] md:text-[22px] font-semibold tracking-tight mb-4 leading-snug">
          {task.title}
        </h1>
      )}

      <div className="mb-8 pb-6 border-b border-border">
        <p className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{ color: isDone ? 'var(--muted-foreground)' : 'var(--foreground)' }}>
          {task.body}
        </p>
      </div>

      <div className="space-y-3 mb-8 pb-6 border-b border-border">
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
          <Badge variant={isDone ? 'secondary' : 'default'} className="text-xs">
            {isDone ? 'Completada' : 'Activa'}
          </Badge>
        </MetaRow>

        <MetaRow label="Tipo">
          <span className={task.type !== 'normal' ? 'text-primary' : 'text-muted-foreground'}>
            {task.type}
          </span>
        </MetaRow>

        {task.assignee && (
          <MetaRow label="Responsable">
            <span className="text-muted-foreground">{task.assignee}</span>
          </MetaRow>
        )}

        <MetaRow label="Creada">
          <span className="text-muted-foreground">
            {task.createdAt.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </MetaRow>

        {task.deadline && (() => {
          const dl = new Date(task.deadline)
          const now = new Date()
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const dlDay = new Date(dl.getFullYear(), dl.getMonth(), dl.getDate())
          const isOverdue = !isDone && dlDay < today
          const isToday = dlDay.getTime() === today.getTime()
          return (
            <MetaRow label="Fecha límite">
              <span className={isOverdue ? 'text-destructive' : isToday ? 'text-primary' : 'text-muted-foreground'}>
                {dl.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                {isOverdue && ' (vencida)'}
                {isToday && !isDone && ' (hoy)'}
              </span>
            </MetaRow>
          )
        })()}

        {task.completedAt && (
          <MetaRow label="Completada">
            <span className="text-muted-foreground">
              {task.completedAt.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </MetaRow>
        )}

        {task.tags && task.tags.length > 0 && (
          <MetaRow label="Tags">
            <div className="flex flex-wrap gap-1.5">
              {task.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-[11px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </MetaRow>
        )}

        {task.capRef && (
          <MetaRow label="Ref">
            <span className="tabular-nums text-muted-foreground">{task.capRef}</span>
          </MetaRow>
        )}
      </div>

      {/* Documents */}
      {task.documents.length > 0 && (
        <div className="mb-8 pb-6 border-b border-border">
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-3 text-muted-foreground">
            Documentos ({task.documents.length})
          </p>
          <div className="space-y-2">
            {task.documents.map(td => (
              <Card key={td.document.id}>
                <CardContent className="flex items-center gap-3 px-3 py-2.5">
                  <span className="text-[13px] text-foreground">{td.document.name}</span>
                  {td.document.url && (
                    <a href={td.document.url} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] ml-auto transition-opacity hover:opacity-70 text-primary">
                      Abrir
                    </a>
                  )}
                  {td.document.mimeType && (
                    <span className="text-[10px] text-muted-foreground">
                      {td.document.mimeType}
                    </span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3 text-muted-foreground">
          Comentarios {task.comments.length > 0 && `(${task.comments.length})`}
        </p>

        {task.comments.length > 0 && (
          <div className="space-y-3 mb-4">
            {task.comments.map(c => (
              <Card key={c.id}>
                <CardContent className="px-3 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {c.author}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {c.createdAt.toLocaleDateString('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {c.authorType === 'agent' && (
                      <Badge variant="outline" className="text-[10px] text-primary border-primary/20">
                        agente
                      </Badge>
                    )}
                  </div>
                  <p className="text-[13px] whitespace-pre-wrap leading-relaxed text-foreground">
                    {c.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <AddComment taskId={task.id} />
      </div>

      {/* Contacts */}
      {task.space.contacts.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-3 text-muted-foreground">
            Contactos de {task.space.name} ({task.space.contacts.length})
          </p>
          <div className="space-y-2">
            {task.space.contacts.map(c => (
              <Card key={c.id}>
                <CardContent className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 bg-secondary text-muted-foreground">
                    {c.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground">{c.name}</p>
                    {c.role && <p className="text-[11px] text-muted-foreground">{c.role}</p>}
                  </div>
                  {c.phone && (
                    <a href={`tel:${c.phone}`} className="text-[11px] transition-opacity hover:opacity-70 text-primary">
                      {c.phone}
                    </a>
                  )}
                </CardContent>
              </Card>
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
      <span className="text-xs shrink-0 w-24 pt-0.5 text-muted-foreground">
        {label}
      </span>
      <div className="text-[13px] flex-1 min-w-0">{children}</div>
    </div>
  )
}
