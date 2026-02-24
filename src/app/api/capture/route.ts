import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Normalize task title to start with infinitive verb
function normalizeTareaTitle(text: string): string {
  // Take first sentence
  let t = text.split(/[.\n]/)[0].trim()
  // Strip leading filler phrases
  const fillers = [
    /^(hay que|tengo que|necesito|se debe|se necesita|debemos|debes|necesitamos|quiero|vamos a|voy a|se requiere|falta|pendiente[:\s]+)/i,
    /^(hacer|realizar|ejecutar)\s+que\s+/i,
  ]
  for (const f of fillers) t = t.replace(f, '')
  // Capitalize first letter
  t = t.charAt(0).toUpperCase() + t.slice(1)
  return t.substring(0, 80)
}

// GET /api/capture?domain=&space=&type=&limit=&offset=
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const domain = searchParams.get('domain')
    const space = searchParams.get('space')
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}
    if (type) where.type = type
    if (domain || space) {
      where.space = {}
      if (space) where.space.slug = space
      if (domain) where.space.domain = { slug: domain }
    }

    const [captures, total] = await Promise.all([
      prisma.capture.findMany({
        where,
        include: { space: { include: { domain: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.capture.count({ where }),
    ])

    return NextResponse.json({ captures, total, limit, offset })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// POST /api/capture
export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { body, title, type, domain, space, status, confidence, deadline, frequency, tags, sourceUrl, metadata } = data

    if (!body) return NextResponse.json({ error: 'body required' }, { status: 400 })

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

    if (!spaceRecord) {
      const sandbox = await prisma.domain.findFirst({ where: { slug: 'sandbox' } })
      if (sandbox) {
        spaceRecord = await prisma.space.findFirst({
          where: { domainId: sandbox.id, slug: 'ideas' }
        })
      }
    }

    if (!spaceRecord) return NextResponse.json({ error: 'no space found' }, { status: 500 })

    // Auto-generate capRef
    const lastCapture = await prisma.capture.findFirst({
      where: { capRef: { not: null } },
      orderBy: { capRef: 'desc' },
    })
    const lastNum = lastCapture?.capRef ? parseInt(lastCapture.capRef.replace('cap-', '')) : 0
    const capRef = `cap-${String(lastNum + 1).padStart(3, '0')}`

    // Auto-generate title from body
    const rawTitle = title || body.split('\n')[0]
    const autoTitle = (!title && (type === 'tarea' || type === 'task'))
      ? normalizeTareaTitle(rawTitle)
      : rawTitle.substring(0, 80)

    const capture = await prisma.capture.create({
      data: {
        spaceId: spaceRecord.id,
        type: type || 'idea',
        title: autoTitle,
        body,
        tags: tags || [],
        sourceUrl,
        status: status || (type === 'tarea' ? 'open' : null),
        confidence,
        deadline: deadline ? new Date(deadline) : null,
        frequency,
        metadata,
        source: 'api',
        capRef,
      },
      include: { space: { include: { domain: true } } },
    })

    return NextResponse.json({ ok: true, capture })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
