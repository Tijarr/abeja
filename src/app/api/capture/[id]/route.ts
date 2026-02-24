import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT /api/capture/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    const data = await req.json()
    const { body, title, type, status, confidence, deadline, frequency, tags, sourceUrl, metadata, spaceId } = data

    const capture = await prisma.capture.update({
      where: { id },
      data: {
        ...(body !== undefined && { body }),
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(status !== undefined && { status }),
        ...(confidence !== undefined && { confidence }),
        ...(deadline !== undefined && { deadline: deadline ? new Date(deadline) : null }),
        ...(frequency !== undefined && { frequency }),
        ...(tags !== undefined && { tags }),
        ...(sourceUrl !== undefined && { sourceUrl }),
        ...(metadata !== undefined && { metadata }),
        ...(spaceId !== undefined && { spaceId }),
      },
      include: { space: { include: { domain: true } } },
    })

    return NextResponse.json({ ok: true, capture })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}

// DELETE /api/capture/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await params
    const id = parseInt(idStr)
    await prisma.capture.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
