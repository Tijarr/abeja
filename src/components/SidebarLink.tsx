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

export function SidebarDomainLink({ href, color, name }: { href: string; color: string; name: string }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-2 py-1 rounded-md text-[12px] font-semibold uppercase tracking-wider transition-colors hover:bg-[var(--surface-hover)]"
      style={{ color: isActive ? 'var(--text-secondary)' : 'var(--text-tertiary)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="flex-1 truncate">{name}</span>
    </Link>
  )
}

export function SidebarSpaceLink({ href, count, name }: { href: string; count: number; name: string }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link
      href={href}
      className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-md text-[13px] transition-colors hover:bg-[var(--surface-hover)]"
      style={{
        color: isActive ? 'var(--text)' : 'var(--text-secondary)',
        fontWeight: isActive ? 500 : 400,
        background: isActive ? 'var(--surface-hover)' : undefined,
      }}
    >
      <span className="flex-1 truncate capitalize">{name}</span>
      <span className="text-[11px] shrink-0" style={{ color: 'var(--text-tertiary)' }}>{count}</span>
    </Link>
  )
}
