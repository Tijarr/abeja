import { prisma } from '@/lib/prisma'
import { DOMAIN_CONFIG } from '@/lib/types'
import Link from 'next/link'

export default async function Sidebar() {
  const domains = await prisma.domain.findMany({
    include: { spaces: { include: { _count: { select: { captures: true } } } } },
    orderBy: { sortOrder: 'asc' },
  })

  const domainCounts = domains.map(d => ({
    ...d,
    count: d.spaces.reduce((a, s) => a + s._count.captures, 0),
    openCount: 0,
  }))

  return (
    <aside
      className="w-[240px] shrink-0 flex flex-col h-screen overflow-y-auto"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-[14px] flex items-center gap-2 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-[15px] font-semibold tracking-tight">🐝 Abeja</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">

        {/* Top links */}
        <div className="space-y-0.5 mb-4">
          <NavItem href="/">Dashboard</NavItem>
          <NavItem href="/captures">Todas las capturas</NavItem>
        </div>

        {/* Domains */}
        <p
          className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Dominios
        </p>
        <div className="space-y-0.5">
          {domainCounts.map(domain => {
            const cfg = DOMAIN_CONFIG[domain.slug]
            if (domain.count === 0) return null
            return (
              <Link
                key={domain.slug}
                href={`/domain/${domain.slug}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors hover:bg-[var(--surface-hover)] group"
                style={{ color: 'var(--text-secondary)' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: cfg?.color || '#666' }}
                />
                <span className="flex-1 truncate group-hover:text-[var(--text)] transition-colors">
                  {domain.name}
                </span>
                <span
                  className="text-[11px] shrink-0"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {domain.count}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div
        className="px-3 py-3 shrink-0"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <button
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-[13px] font-medium transition-opacity hover:opacity-85"
          style={{ background: 'var(--accent)', color: '#0a0a0a' }}
          data-new-capture="true"
        >
          <span className="text-[15px] leading-none">+</span>
          Nueva captura
        </button>
      </div>
    </aside>
  )
}

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors hover:bg-[var(--surface-hover)]"
      style={{ color: 'var(--text-secondary)' }}
    >
      {children}
    </Link>
  )
}
