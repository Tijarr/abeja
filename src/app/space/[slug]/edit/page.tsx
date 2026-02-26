import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { resolveSlug } from '@/lib/slug-redirect'
import Link from 'next/link'
import SpaceEditForm from './SpaceEditForm'

export const dynamic = 'force-dynamic'

export default async function SpaceEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const space = await prisma.space.findFirst({
    where: { slug },
    include: {
      domain: true,
      _count: { select: { tasks: true, contacts: true, documents: true } },
    },
  })

  if (!space) {
    const resolved = await resolveSlug(slug, 'space')
    if (resolved) redirect(`/space/${resolved}/edit`)
    notFound()
  }

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-16 max-w-2xl">
      <div className="flex items-center gap-2 mb-6 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
        <Link href="/" className="transition-opacity hover:opacity-70">Inicio</Link>
        <span>›</span>
        <span style={{ color: space.domain.color }}>{space.domain.name}</span>
        <span>›</span>
        <Link href={`/space/${space.slug}`} className="transition-opacity hover:opacity-70"
          style={{ color: space.color || space.domain.color }}>
          {space.name}
        </Link>
        <span>›</span>
        <span>Editar</span>
      </div>

      <SpaceEditForm
        slug={space.slug}
        name={space.name}
        description={space.description || ''}
        color={space.color || space.domain.color}
        domainName={space.domain.name}
        taskCount={space._count.tasks}
        contactCount={space._count.contacts}
        documentCount={space._count.documents}
      />
    </div>
  )
}
