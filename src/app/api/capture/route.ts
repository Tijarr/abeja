import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { content, type, domain, space, status, confidence, deadline, frequency } = body

    if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })

    // Find or default space
    let spaceRecord
    if (domain && space) {
      const domainRecord = await prisma.domain.findUnique({ where: { slug: domain } })
      if (domainRecord) {
        spaceRecord = await prisma.space.findFirst({
          where: { domainId: domainRecord.id, slug: space }
        })
      }
    }

    // Default to sandbox/ideas
    if (!spaceRecord) {
      const sandbox = await prisma.domain.findUnique({ where: { slug: 'sandbox' } })
      if (sandbox) {
        spaceRecord = await prisma.space.findFirst({
          where: { domainId: sandbox.id, slug: 'ideas' }
        })
      }
    }

    if (!spaceRecord) return NextResponse.json({ error: 'no space found' }, { status: 500 })

    const capture = await prisma.capture.create({
      data: {
        spaceId: spaceRecord.id,
        type: type || 'idea',
        content,
        status: status || (type === 'task' ? 'open' : null),
        confidence,
        deadline: deadline ? new Date(deadline) : null,
        frequency,
        source: 'api',
      },
    })

    return NextResponse.json({ ok: true, capture })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
