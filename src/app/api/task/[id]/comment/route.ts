import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const taskId = parseInt(idStr)
    if (isNaN(taskId)) return NextResponse.json({ error: 'invalid id' }, { status: 400 })

    const data = await req.json()
    const { body, author, authorType } = data

    if (!body) return NextResponse.json({ error: 'body required' }, { status: 400 })

    const comment = await prisma.comment.create({
      data: {
        taskId,
        body,
        author: author || 'angel',
        authorType: authorType || 'human',
      },
    })

    return NextResponse.json({ ok: true, comment })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
