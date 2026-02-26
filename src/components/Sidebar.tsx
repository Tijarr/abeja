import { prisma } from '@/lib/prisma'
import { SidebarNavItem, SidebarDomainGroup, SidebarSpaceLink, HomeIcon, TasksIcon } from './SidebarLink'

export default async function Sidebar() {
  const domains = await prisma.domain.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      spaces: {
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { tasks: { where: { status: 'open' } } } } },
      },
    },
  })

  return (
    <aside
      className="w-full md:w-[240px] shrink-0 flex flex-col h-screen overflow-y-auto"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    >
      <div className="px-4 py-3 flex items-center shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-[13px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Abeja</span>
      </div>

      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        <div className="space-y-px mb-3">
          <SidebarNavItem href="/" icon={HomeIcon}>Inicio</SidebarNavItem>
          <SidebarNavItem href="/tasks" icon={TasksIcon}>Tareas</SidebarNavItem>
        </div>

        {domains.map((domain, i) => {
          const spacesWithTasks = domain.spaces.filter(s => s._count.tasks > 0)
          if (spacesWithTasks.length === 0) return null
          return (
            <SidebarDomainGroup
              key={domain.id}
              name={domain.name}
              color={domain.color}
              slug={domain.slug}
              defaultOpen={i < 3}
            >
              {spacesWithTasks.map(space => (
                <SidebarSpaceLink
                  key={space.id}
                  href={`/space/${space.slug}`}
                  count={space._count.tasks}
                  name={space.name}
                  color={space.color || domain.color}
                  slug={space.slug}
                />
              ))}
            </SidebarDomainGroup>
          )
        })}
      </nav>

      <div className="px-2 py-2 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-opacity hover:opacity-85"
          style={{ background: 'var(--accent)', color: '#0a0a0a' }}
          data-new-capture="true"
        >
          <span className="text-[13px] leading-none font-light">+</span>
          Nueva tarea
        </button>
      </div>
    </aside>
  )
}
