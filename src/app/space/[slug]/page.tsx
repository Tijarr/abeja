import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { resolveSlug } from '@/lib/slug-redirect'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Hexagon } from 'lucide-react'
import { SpaceTabs } from './SpaceTabs'

export const dynamic = 'force-dynamic'

export default async function SpacePage({ params }: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

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

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge variant="secondary" className="text-[11px]">{activeTasks.length} activas</Badge>
        <Badge variant="secondary" className="text-[11px]">{delegatedTasks.length} delegadas</Badge>
        <Badge variant="secondary" className="text-[11px]">{doneTasks.length} finalizadas</Badge>
        <Badge variant="secondary" className="text-[11px]">{pctDone}%</Badge>
        <Progress value={pctDone} className="flex-1 max-w-[120px] h-[3px]" />
      </div>

      <SpaceTabs
        active={activeTasks}
        delegated={delegatedTasks}
        done={doneTasks}
      />
    </div>
  )
}
