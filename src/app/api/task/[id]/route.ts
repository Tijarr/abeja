import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isValidPriority } from '@/lib/types'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    if (isNaN(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    const data = await req.json()
    const { body, title, status, deadline, tags, spaceId, type, assignee, priority } = data

    if (priority !== undefined && !isValidPriority(priority)) {
      return NextResponse.json({ error: 'invalid priority. Must be: urgent, high, normal, low, review' }, { status: 400 })
    }

    const resolvedStatus = status === 'open' ? 'active' : status

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(body !== undefined && { body }),
        ...(title !== undefined && { title }),
        ...(status !== undefined && { status: resolvedStatus }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(tags !== undefined && { tags }),
        ...(spaceId !== undefined && { spaceId }),
        ...(type !== undefined && { type }),
        ...(assignee !== undefined && { assignee }),
        ...(priority !== undefined && { priority }),
        ...(status === 'done' && { completedAt: new Date() }),
      },
      include: { space: true },
    })

    return NextResponse.json({ ok: true, task })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    if (isNaN(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    await prisma.comment.deleteMany({ where: { taskId: id } })
    await prisma.taskDocument.deleteMany({ where: { taskId: id } })
    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
