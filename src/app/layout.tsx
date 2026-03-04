import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NewCaptureModal from '@/components/NewCaptureModal'
import AppShell from '@/components/AppShell'
import FAB from '@/components/FAB'
import { isAuthenticated } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { SidebarTrigger } from '@/components/ui/sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Abeja',
  description: 'Tablero de control',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAuthenticated()

  if (!authed) {
    return (
      <html lang="es">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    )
  }

  const [domains, inboxCount] = await Promise.all([
    prisma.domain.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        spaces: {
          orderBy: { sortOrder: 'asc' },
          include: { _count: { select: { tasks: { where: { status: 'active' } } } } },
        },
      },
    }),
    prisma.task.count({ where: { status: 'active' } }),
  ])

  const sidebarData = domains.map(d => ({
    id: d.id,
    name: d.name,
    slug: d.slug,
    color: d.color,
    spaces: d.spaces.map(s => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      color: s.color,
      _count: { tasks: s._count.tasks },
    })),
  }))

  return (
    <html lang="es">
      <body className={inter.className}>
        <SidebarProvider>
          <AppShell domains={sidebarData} inboxCount={inboxCount} />
          <SidebarInset className="min-w-0 overflow-hidden">
            <header className="md:hidden flex h-12 shrink-0 items-center gap-2 border-b border-border bg-card px-4 pt-[max(0rem,env(safe-area-inset-top))]">
              <SidebarTrigger className="-ml-1 text-muted-foreground" />
              <span className="text-[15px] font-semibold tracking-tight text-primary">ABEJA.CO</span>
            </header>
            <div className="flex-1 overflow-y-auto min-w-0">
              {children}
              <FAB />
            </div>
          </SidebarInset>
          <NewCaptureModal />
        </SidebarProvider>
      </body>
    </html>
  )
}
