'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export function SidebarNavItem({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-2 py-1 rounded-md text-[13px] transition-colors hover:bg-[var(--surface-hover)]"
      style={{
        color: isActive ? 'var(--text)' : 'var(--text-secondary)',
        fontWeight: isActive ? 500 : 400,
        background: isActive ? 'var(--surface-hover)' : undefined,
      }}
    >
      <span className="w-4 h-4 flex items-center justify-center shrink-0" style={{ opacity: isActive ? 1 : 0.6 }}>
        {icon}
      </span>
      {children}
    </Link>
  )
}

export function SidebarDomainGroup({ name, color, slug, children, defaultOpen }: {
  name: string; color: string; slug: string; children: React.ReactNode; defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`sidebar-domain-${slug}`)
      if (stored !== null) setOpen(stored === '1')
    } catch {}
  }, [slug])

  function toggle() {
    const next = !open
    setOpen(next)
    try { localStorage.setItem(`sidebar-domain-${slug}`, next ? '1' : '0') } catch {}
  }

  return (
    <div className="mb-1">
      <div className="group flex items-center gap-1 px-2 py-1 cursor-pointer rounded-md transition-colors hover:bg-[var(--surface-hover)]"
        onClick={toggle}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"
          className="shrink-0 transition-transform duration-150"
          style={{ color: 'var(--text-tertiary)', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          <path d="M3 1.5L7 5L3 8.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[10px] font-semibold uppercase tracking-widest flex-1"
          style={{ color: 'var(--text-tertiary)' }}>
          {name}
        </span>
        <Link href={`/domain/${slug}/edit`} onClick={e => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-[var(--border)]"
          title="Editar dominio">
          <EditIcon />
        </Link>
      </div>
      {open && (
        <div className="mt-0.5 space-y-px">
          {children}
        </div>
      )}
    </div>
  )
}

export function SidebarSpaceLink({ href, count, name, color, slug }: {
  href: string; count: number; name: string; color: string; slug: string
}) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <div className="group flex items-center">
      <Link
        href={href}
        className="flex-1 flex items-center gap-2 pl-5 pr-1 py-1 rounded-md text-[13px] transition-colors hover:bg-[var(--surface-hover)]"
        style={{
          color: isActive ? 'var(--text)' : 'var(--text-secondary)',
          fontWeight: isActive ? 500 : 400,
          background: isActive ? 'var(--surface-hover)' : undefined,
        }}
      >
        <HexIcon color={color} />
        <span className="flex-1 truncate">{name}</span>
        <span className="text-[11px] shrink-0 tabular-nums" style={{ color: 'var(--text-tertiary)' }}>{count}</span>
      </Link>
      <Link href={`/space/${slug}/edit`}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 mr-1 rounded hover:bg-[var(--border)]"
        title="Editar espacio">
        <EditIcon />
      </Link>
    </div>
  )
}

function HexIcon({ color, size = 14 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className="shrink-0">
      <path d="M7 1.5L12 4.25V9.75L7 12.5L2 9.75V4.25L7 1.5Z" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor"
      strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: 'var(--text-tertiary)' }}>
      <path d="M7 2l3 3-7 7H0v-3z" />
      <path d="M5.5 3.5l3 3" />
    </svg>
  )
}

// Icons for nav items
export const HomeIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
    strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 5.5L7 1l5.5 4.5V12a1 1 0 01-1 1h-9a1 1 0 01-1-1V5.5z" />
    <path d="M5 13V8h4v5" />
  </svg>
)

export const TasksIcon = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
    strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="5.5" />
    <path d="M4.5 7l2 2 3-3.5" />
  </svg>
)
