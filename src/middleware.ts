import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PASSWORD = process.env.ABEJA_PASSWORD || 'abeja2026'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow login page and auth API
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const auth = request.cookies.get('abeja_auth')?.value
  if (auth !== PASSWORD) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
