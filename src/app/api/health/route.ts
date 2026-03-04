import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const dbUrl = process.env.DATABASE_URL || 'NOT SET'
  const masked = dbUrl.replace(/\/\/.*@/, '//***@')

  try {
    const count = await prisma.domain.count()
    return NextResponse.json({
      ok: true,
      db: masked,
      dbUrlLength: dbUrl.length,
      dbUrlEndsWithNewline: dbUrl.endsWith('\n'),
      dbUrlEndsWithSpace: dbUrl.endsWith(' '),
      domainCount: count,
      env: process.env.NODE_ENV,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({
      ok: false,
      db: masked,
      dbUrlLength: dbUrl.length,
      dbUrlEndsWithNewline: dbUrl.endsWith('\n'),
      error: msg,
    }, { status: 500 })
  }
}
