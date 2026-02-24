import { prisma } from '@/lib/prisma'
import { DOMAIN_CONFIG } from '@/lib/types'
import { SidebarNavItem, SidebarDomainLink, SidebarSpaceLink } from './SidebarLink'

export default async function Sidebar() {
  const domains = await prisma.domain.findMany({
    include: {
      spaces: {
        include: { _count: { select: { captures: { where: { status: 'open' } } } } },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <aside
      className="w-full md:w-[260px] shrink-0 flex flex-col h-screen overflow-y-auto"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-[14px] flex items-center shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-[14px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Abeja</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">

        {/* Top links */}
        <div className="space-y-0.5 mb-4">
          <SidebarNavItem href="/">Inicio</SidebarNavItem>
          <SidebarNavItem href="/captures">Capturas</SidebarNavItem>
        </div>

        {/* Domains + Spaces */}
        <p
          className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Espacios
        </p>
        <div className="space-y-0.5">
          {domains.map(domain => {
            const cfg = DOMAIN_CONFIG[domain.slug]
            const domColor = cfg?.color || '#888'
            const activeSpaces = domain.spaces.filter(s => s._count.captures > 0)
            if (activeSpaces.length === 0) return null

            return (
              <div key={domain.slug}>
                <SidebarDomainLink
                  href={`/domain/${domain.slug}`}
                  color={domColor}
                  name={domain.name}
                />
                <div className="ml-3 mt-0.5 mb-1 space-y-0.5 border-l" style={{ borderColor: 'var(--border)' }}>
                  {activeSpaces.map(space => (
                    <SidebarSpaceLink
                      key={space.id}
                      href={`/domain/${domain.slug}/space/${space.slug}`}
                      count={space._count.captures}
                      name={space.name}
                    />
                  ))}
                </div>
              </div>
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
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-opacity hover:opacity-85"
          style={{ background: 'var(--accent)', color: '#0a0a0a' }}
          data-new-capture="true"
        >
          <span className="text-[14px] leading-none font-light">+</span>
          Nueva captura
        </button>
      </div>
    </aside>
  )
}
