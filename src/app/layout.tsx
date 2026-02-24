import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NewCaptureModal from '@/components/NewCaptureModal'
import Sidebar from '@/components/Sidebar'
import MobileMenuDrawer from '@/components/MobileMenuDrawer'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Abeja',
  description: 'Context engine personal',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('abeja_auth')?.value
  const isAuthenticated = !!authCookie && authCookie.length > 0

  if (!isAuthenticated) {
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
          <div className="hidden md:flex md:shrink-0">
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
            </main>
          </div>
        </div>
        <NewCaptureModal />
      </body>
    </html>
  )
}
