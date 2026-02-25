import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const spaces = await prisma.space.findMany({
      orderBy: { sortOrder: 'asc' },
      select: { slug: true, name: true, color: true },
    })
    return NextResponse.json({ spaces })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
