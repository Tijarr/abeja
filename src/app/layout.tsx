import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NewCaptureModal from '@/components/NewCaptureModal'
import AppShell from '@/components/AppShell'
import FAB from '@/components/FAB'
import { isAuthenticated } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { TooltipProvider } from '@/components/ui/tooltip'

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
        <TooltipProvider>
          <AppShell domains={sidebarData} inboxCount={inboxCount}>
            {children}
            <FAB />
          </AppShell>
          <NewCaptureModal />
        </TooltipProvider>
      </body>
    </html>
  )
}
