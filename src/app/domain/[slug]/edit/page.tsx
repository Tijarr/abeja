import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { resolveSlug } from '@/lib/slug-redirect'
import Link from 'next/link'
import DomainEditForm from './DomainEditForm'

export const dynamic = 'force-dynamic'

export default async function DomainEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const domain = await prisma.domain.findUnique({
    where: { slug },
    include: { spaces: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!domain) {
    const resolved = await resolveSlug(slug, 'domain')
    if (resolved) redirect(`/domain/${resolved}/edit`)
    notFound()
  }

  return (
    <div className="px-4 md:px-8 pt-4 md:pt-6 pb-16 max-w-2xl">
      <div className="flex items-center gap-2 mb-6 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
        <Link href="/" className="transition-opacity hover:opacity-70">Inicio</Link>
        <span>›</span>
        <span>Editar dominio</span>
      </div>

      <DomainEditForm
        slug={domain.slug}
        name={domain.name}
        description={domain.description || ''}
        color={domain.color}
        spaceCount={domain.spaces.length}
      />
    </div>
  )
}
