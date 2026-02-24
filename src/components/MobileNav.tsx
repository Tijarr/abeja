'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <header
      className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 shrink-0"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
    >
      <Link href="/" className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>
        Abeja
      </Link>
      <div className="flex items-center gap-2">
        <Link href="/" className="px-3 py-1.5 rounded-md text-[13px] transition-colors"
          style={{ color: pathname === '/' ? 'var(--text)' : 'var(--text-secondary)' }}>
          Inicio
        </Link>
        <Link href="/captures" className="px-3 py-1.5 rounded-md text-[13px] transition-colors"
          style={{ color: pathname === '/captures' ? 'var(--text)' : 'var(--text-secondary)' }}>
          Capturas
        </Link>
        <button
          data-new-capture="true"
          className="px-3 py-1.5 rounded-md text-[13px] font-medium"
          style={{ background: 'var(--accent)', color: '#0a0a0a' }}
        >
          +
        </button>
      </div>
    </header>
  )
}
