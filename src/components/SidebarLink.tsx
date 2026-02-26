'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SidebarNavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors hover:bg-[var(--surface-hover)]"
      style={{
        color: isActive ? 'var(--text)' : 'var(--text-secondary)',
        fontWeight: isActive ? 500 : 400,
        background: isActive ? 'var(--surface-hover)' : undefined,
      }}
    >
      {children}
    </Link>
  )
}

export function SidebarDomainLabel({ name, color }: { name: string; color: string }) {
  return (
    <p className="px-2 mb-1.5 mt-1 text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5"
      style={{ color }}>
      <span className="w-1 h-1 rounded-full" style={{ background: color, opacity: 0.6 }} />
      {name}
    </p>
  )
}

export function SidebarSpaceLink({ href, count, name, color }: { href: string; count: number; name: string; color: string }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors hover:bg-[var(--surface-hover)]"
      style={{
        color: isActive ? 'var(--text)' : 'var(--text-secondary)',
        fontWeight: isActive ? 500 : 400,
        background: isActive ? 'var(--surface-hover)' : undefined,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="flex-1 truncate">{name}</span>
      <span className="text-[11px] shrink-0" style={{ color: 'var(--text-tertiary)' }}>{count}</span>
    </Link>
  )
}
