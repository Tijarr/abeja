import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

function normalizeTitle(text: string): string {
  let t = text.split(/[.\n]/)[0].trim()
  const fillers = [
    /^(hay que|tengo que|necesito|se debe|se necesita|debemos|debes|necesitamos|quiero|vamos a|voy a|se requiere|falta|pendiente[:\s]+)/i,
    /^(hacer|realizar|ejecutar)\s+que\s+/i,
  ]
  for (const f of fillers) t = t.replace(f, '')
  t = t.charAt(0).toUpperCase() + t.slice(1)
  return t.substring(0, 80)
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const spaceSlug = searchParams.get('space')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Prisma.TaskWhereInput = {}
    if (spaceSlug) where.space = { slug: spaceSlug }
    if (status) where.status = status

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: { space: { include: { domain: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.task.count({ where }),
    ])

    return NextResponse.json({ tasks, total, limit, offset })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { body, title, space: spaceSlug, deadline, tags, type, assignee } = data

    if (!body) return NextResponse.json({ error: 'body required' }, { status: 400 })

    let spaceRecord = spaceSlug
      ? await prisma.space.findFirst({ where: { slug: spaceSlug } })
      : null

    if (!spaceRecord) {
      spaceRecord = await prisma.space.findFirst({ where: { slug: 'sandbox' } })
    }

    if (!spaceRecord) return NextResponse.json({ error: 'no space found' }, { status: 500 })

    const lastTask = await prisma.task.findFirst({
      where: { capRef: { not: null } },
      orderBy: { capRef: 'desc' },
    })
    const lastNum = lastTask?.capRef ? parseInt(lastTask.capRef.replace('cap-', '')) : 0
    const capRef = `cap-${String(lastNum + 1).padStart(3, '0')}`

    const autoTitle = title || normalizeTitle(body)

    const task = await prisma.task.create({
      data: {
        spaceId: spaceRecord.id,
        title: autoTitle,
        body,
        type: type || 'normal',
        assignee: assignee || null,
        tags: tags || [],
        status: 'open',
        deadline: deadline ? new Date(deadline) : null,
        source: 'api',
        capRef,
      },
      include: { space: true },
    })

    return NextResponse.json({ ok: true, task })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
