import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NewCaptureModal from '@/components/NewCaptureModal'
import Sidebar from '@/components/Sidebar'
import MobileMenuDrawer from '@/components/MobileMenuDrawer'
import FAB from '@/components/FAB'
import { isAuthenticated } from '@/lib/auth'

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
        <body className={inter.className} style={{ background: 'var(--bg)', color: 'var(--text)' }}>
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="es">
      <body className={inter.className} style={{ background: 'var(--bg)', color: 'var(--text)' }}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar — desktop only */}
          <div className="hidden md:flex md:shrink-0" suppressHydrationWarning>
            <Sidebar />
          </div>
          {/* Main area */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Mobile: header + hamburger drawer con sidebar completo */}
            <MobileMenuDrawer>
              <Sidebar />
            </MobileMenuDrawer>
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
              {children}
              <FAB />
            </main>
          </div>
        </div>
        <NewCaptureModal />
      </body>
    </html>
  )
}
