import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const domain = await prisma.domain.findUnique({
      where: { slug },
      include: { spaces: { orderBy: { sortOrder: 'asc' } } },
    })
    if (!domain) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ domain })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug: currentSlug } = await params
    const data = await req.json()
    const { name, slug: newSlug, description, color } = data

    const domain = await prisma.domain.findUnique({ where: { slug: currentSlug } })
    if (!domain) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const slugChanged = newSlug && newSlug !== currentSlug

    if (slugChanged) {
      const existing = await prisma.domain.findUnique({ where: { slug: newSlug } })
      if (existing) return NextResponse.json({ error: 'slug already in use' }, { status: 409 })
    }

    const updated = await prisma.domain.update({
      where: { slug: currentSlug },
      data: {
        ...(name !== undefined && { name }),
        ...(slugChanged && { slug: newSlug }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
      },
    })

    if (slugChanged) {
      await prisma.slugRedirect.create({
        data: { oldSlug: currentSlug, newSlug, type: 'domain' },
      })
    }

    return NextResponse.json({ ok: true, domain: updated, slugChanged })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
