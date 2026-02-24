'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function MobileMenuDrawer({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Sticky mobile header */}
      <header
        className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 shrink-0"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 -ml-1 rounded-md transition-colors hover:bg-[var(--surface-hover)]"
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Abrir menú"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor">
            <rect width="18" height="1.5" rx="0.75" />
            <rect y="6.25" width="18" height="1.5" rx="0.75" />
            <rect y="12.5" width="18" height="1.5" rx="0.75" />
          </svg>
        </button>

        {/* Logo centrado */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold tracking-tight"
          style={{ color: 'var(--text)' }}
        >
          Abeja
        </Link>

        {/* Nueva captura */}
        <button
          data-new-capture="true"
          className="px-3 py-1.5 rounded-md text-[13px] font-medium"
          style={{ background: 'var(--accent)', color: '#0a0a0a' }}
        >
          +
        </button>
      </header>

      {/* Drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50" onClick={() => setOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} />
          {/* Panel */}
          <div
            className="absolute left-0 top-0 bottom-0 overflow-y-auto"
            style={{ width: '280px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close button dentro del drawer */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-md z-10 transition-colors hover:bg-[var(--surface-hover)]"
              style={{ color: 'var(--text-tertiary)' }}
              aria-label="Cerrar menú"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            {children}
          </div>
        </div>
      )}
    </>
  )
}
