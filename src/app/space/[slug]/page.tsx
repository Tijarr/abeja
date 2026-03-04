import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { resolveSlug } from '@/lib/slug-redirect'
import Link from 'next/link'
import TaskRow from '@/components/TaskRow'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Hexagon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function SpacePage({ params, searchParams }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { slug } = await params
  const { tab } = await searchParams
  const activeTab = tab || 'active'

  const space = await prisma.space.findFirst({
    where: { slug },
    include: {
      domain: true,
      tasks: { orderBy: { createdAt: 'desc' } },
      _count: { select: { contacts: true, documents: true } },
    },
  })

  if (!space) {
    const resolved = await resolveSlug(slug, 'space')
    if (resolved) redirect(`/space/${resolved}`)
    notFound()
  }

  const color = space.color || space.domain.color
  const activeTasks = space.tasks.filter(t => t.status === 'active')
  const delegatedTasks = space.tasks.filter(t => t.status === 'delegated')
  const doneTasks = space.tasks.filter(t => t.status === 'done')
  const total = space.tasks.length
  const pctDone = total > 0 ? Math.round((doneTasks.length / total) * 100) : 0

  const visibleTasks = activeTab === 'done'
    ? doneTasks
    : activeTab === 'delegated'
      ? delegatedTasks
      : activeTasks

  const tabLabel: Record<string, string> = {
    active: 'activas',
    delegated: 'delegadas',
    done: 'finalizadas',
  }

  return (
    <div className="px-4 md:px-8 pb-10">
      <div className="h-[52px] flex items-center gap-2.5">
        <Hexagon className="h-4 w-4 shrink-0" style={{ color }} />
        <span className="text-[15px] font-semibold text-foreground">{space.name}</span>
        <span className="text-xs font-mono text-muted-foreground">{activeTasks.length}</span>
      </div>

      <Breadcrumb className="mb-3">
        <BreadcrumbList className="text-[11px]">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="opacity-70">Inicio</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span style={{ color: space.domain.color }}>{space.domain.name}</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span style={{ color }}>{space.name}</span>
          </BreadcrumbItem>
          {space._count.contacts > 0 && (
            <BreadcrumbItem>
              <span className="ml-2 text-muted-foreground">{space._count.contacts} contactos</span>
            </BreadcrumbItem>
          )}
          {space._count.documents > 0 && (
            <BreadcrumbItem>
              <span className="text-muted-foreground">{space._count.documents} docs</span>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {space.description && (
        <p className="text-xs mb-3 text-muted-foreground">{space.description}</p>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{activeTasks.length} activas</span>
          <span>·</span>
          <span>{delegatedTasks.length} delegadas</span>
          <span>·</span>
          <span>{doneTasks.length} finalizadas</span>
          <span>·</span>
          <span>{pctDone}%</span>
        </div>
        <Progress value={pctDone} className="flex-1 max-w-[120px] h-[3px]" />
      </div>

      <div className="flex items-center gap-4 mb-3" role="tablist" aria-label="Filtrar por estado">
        <TabLink href={`/space/${slug}`} active={activeTab === 'active'}>
          Activas <span className="font-mono">{activeTasks.length}</span>
        </TabLink>
        <TabLink href={`/space/${slug}?tab=delegated`} active={activeTab === 'delegated'}>
          Delegadas <span className="font-mono">{delegatedTasks.length}</span>
        </TabLink>
        <TabLink href={`/space/${slug}?tab=done`} active={activeTab === 'done'}>
          Finalizadas <span className="font-mono">{doneTasks.length}</span>
        </TabLink>
      </div>

      <div>
        {visibleTasks.map(t => (
          <TaskRow
            key={t.id}
            id={t.id}
            title={t.title || t.body}
            priority={t.priority}
            createdAt={t.createdAt}
            assignee={t.assignee}
            deadline={t.deadline}
            done={t.status === 'done'}
          />
        ))}
      </div>

      {visibleTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-[13px] text-muted-foreground">
            Sin tareas {tabLabel[activeTab] || 'activas'}
          </p>
          {activeTab === 'active' && (
            <p className="text-[11px] mt-1 text-muted-foreground">
              Usa + Nueva tarea para crear una
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function TabLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href}
      role="tab"
      aria-selected={active}
      className={cn(
        'text-[13px]',
        active ? 'text-foreground font-medium' : 'text-muted-foreground',
      )}>
      {children}
    </Link>
  )
}
