import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import NewCaptureModal from '@/components/NewCaptureModal'
import Sidebar from '@/components/Sidebar'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🐝 Abeja',
  description: 'Sistema de captura y contexto',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Check auth cookie — don't render sidebar on login page
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
          <Sidebar />
          <main className="flex-1 overflow-y-auto min-w-0">
            {children}
          </main>
        </div>
        <NewCaptureModal />
      </body>
    </html>
  )
}
