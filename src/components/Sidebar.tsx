import { prisma } from '@/lib/prisma'
import { SidebarNavItem, SidebarSpaceLink } from './SidebarLink'

export default async function Sidebar() {
  const spaces = await prisma.space.findMany({
    include: { _count: { select: { tasks: { where: { status: 'open' } } } } },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <aside
      className="w-full md:w-[260px] shrink-0 flex flex-col h-screen overflow-y-auto"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    >
      <div className="px-4 py-[14px] flex items-center shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-[14px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Abeja</span>
      </div>

      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        <div className="space-y-0.5 mb-4">
          <SidebarNavItem href="/">Inicio</SidebarNavItem>
          <SidebarNavItem href="/tasks">Tareas</SidebarNavItem>
        </div>

        <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: 'var(--text-tertiary)' }}>
          Espacios
        </p>
        <div className="space-y-0.5">
          {spaces.filter(s => s._count.tasks > 0).map(space => (
            <SidebarSpaceLink
              key={space.id}
              href={`/space/${space.slug}`}
              count={space._count.tasks}
              name={space.name}
              color={space.color || '#888'}
            />
          ))}
        </div>
      </nav>

      <div className="px-3 py-3 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-opacity hover:opacity-85"
          style={{ background: 'var(--accent)', color: '#0a0a0a' }}
          data-new-capture="true"
        >
          <span className="text-[14px] leading-none font-light">+</span>
          Nueva tarea
        </button>
      </div>
    </aside>
  )
}
