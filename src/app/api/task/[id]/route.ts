import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    if (isNaN(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 })
    const data = await req.json()
    const { body, title, status, deadline, tags, spaceId } = data

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(body !== undefined && { body }),
        ...(title !== undefined && { title }),
        ...(status !== undefined && { status }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(tags !== undefined && { tags }),
        ...(spaceId !== undefined && { spaceId }),
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
    await prisma.task.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
