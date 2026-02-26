import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const space = await prisma.space.findFirst({
      where: { slug },
      include: { domain: true },
    })
    if (!space) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ space })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug: currentSlug } = await params
    const data = await req.json()
    const { name, slug: newSlug, description, color } = data

    const space = await prisma.space.findFirst({ where: { slug: currentSlug } })
    if (!space) return NextResponse.json({ error: 'not found' }, { status: 404 })

    const slugChanged = newSlug && newSlug !== currentSlug

    if (slugChanged) {
      const existing = await prisma.space.findFirst({ where: { slug: newSlug } })
      if (existing) return NextResponse.json({ error: 'slug already in use' }, { status: 409 })
    }

    const updated = await prisma.space.update({
      where: { id: space.id },
      data: {
        ...(name !== undefined && { name }),
        ...(slugChanged && { slug: newSlug }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
      },
    })

    if (slugChanged) {
      await prisma.slugRedirect.create({
        data: { oldSlug: currentSlug, newSlug, type: 'space' },
      })
    }

    return NextResponse.json({ ok: true, space: updated, slugChanged })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
