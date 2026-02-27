'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

type SpaceData = {
  id: number
  name: string
  slug: string
  color: string | null
  _count: { tasks: number }
}

type DomainData = {
  id: number
  name: string
  slug: string
  color: string
  spaces: SpaceData[]
}

export default function AppShell({
  domains,
  children,
}: {
  domains: DomainData[]
  children: React.ReactNode
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const close = useCallback(() => setDrawerOpen(false), [])
  const pathname = usePathname()

  // Close drawer on route change
  useEffect(() => { close() }, [pathname, close])

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-[220px] md:shrink-0 md:flex-col h-screen overflow-y-auto"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>
        <SidebarContent domains={domains} />
      </aside>

      {/* Content column: mobile header + main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <header className="md:hidden shrink-0 flex items-center justify-between px-4 py-3"
          style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}>
          <button onClick={() => setDrawerOpen(true)}
            className="p-1.5 -ml-1 rounded-md hover:bg-[var(--surface-hover)]"
            style={{ color: 'var(--text-secondary)', border: 'none', background: 'none', cursor: 'pointer' }}
            aria-label="Abrir menu">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="currentColor">
              <rect width="18" height="1.5" rx="0.75" />
              <rect y="6.25" width="18" height="1.5" rx="0.75" />
              <rect y="12.5" width="18" height="1.5" rx="0.75" />
            </svg>
          </button>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold tracking-tight no-underline"
            style={{ color: 'var(--text)' }}>
            Abeja
          </Link>
          <div className="w-10" />
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto min-w-0" style={{ overflowX: 'clip' }}>
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      <div
        className="fixed inset-0 z-50 md:hidden"
        style={{
          pointerEvents: drawerOpen ? 'auto' : 'none',
          visibility: drawerOpen ? 'visible' : 'hidden',
        }}
        onClick={close}
      >
        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{
            background: 'rgba(0,0,0,0.55)',
            opacity: drawerOpen ? 1 : 0,
          }}
        />
        <aside
          className="absolute top-0 left-0 bottom-0 w-[280px] overflow-y-auto transition-transform duration-200 ease-out"
          style={{
            background: 'var(--surface)',
            transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
          onClick={e => e.stopPropagation()}
        >
          <SidebarContent domains={domains} onNavigate={close} />
        </aside>
        <button onClick={close}
          className="absolute top-3 right-3 p-1.5 rounded-md z-10 hover:bg-[var(--surface-hover)] transition-opacity duration-200"
          style={{
            color: 'var(--text-tertiary)',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            opacity: drawerOpen ? 1 : 0,
          }}
          aria-label="Cerrar menu">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}

/* ─── Sidebar content (pure render, no data fetching) ─── */

function SidebarContent({ domains, onNavigate }: { domains: DomainData[]; onNavigate?: () => void }) {
  return (
    <>
      <div className="px-4 h-[52px] flex items-center shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-[15px] font-semibold tracking-tight" style={{ color: 'var(--text)' }}>Abeja</span>
      </div>

      <nav className="flex-1 px-2 py-2 overflow-y-auto">
        <div className="space-y-px mb-3">
          <NavItem href="/" onNavigate={onNavigate}>
            <HomeIcon /> Inicio
          </NavItem>
          <NavItem href="/tasks" onNavigate={onNavigate}>
            <TasksIcon /> Tareas
          </NavItem>
        </div>

        {domains.map((domain, i) => {
          const spacesWithTasks = domain.spaces.filter(s => s._count.tasks > 0)
          if (spacesWithTasks.length === 0) return null
          return (
            <DomainGroup key={domain.id} domain={domain} defaultOpen={i < 3}>
              {spacesWithTasks.map(space => (
                <SpaceLink key={space.id} space={space} domainColor={domain.color} onNavigate={onNavigate} />
              ))}
            </DomainGroup>
          )
        })}
      </nav>

      <div className="px-2 py-2 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium hover:opacity-85"
          style={{ background: 'var(--accent)', color: '#0a0a0a', border: 'none', cursor: 'pointer' }}
          data-new-capture="true">
          <span className="text-[13px] leading-none font-light">+</span>
          Nueva tarea
        </button>
      </div>
    </>
  )
}

/* ─── Nav items ─── */

function NavItem({ href, children, onNavigate }: { href: string; children: React.ReactNode; onNavigate?: () => void }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link href={href} onClick={onNavigate}
      className="flex items-center gap-2 px-2 py-1 rounded-md text-[13px] no-underline hover:bg-[var(--surface-hover)]"
      style={{
        color: isActive ? 'var(--text)' : 'var(--text-secondary)',
        fontWeight: isActive ? 500 : 400,
        background: isActive ? 'var(--surface-hover)' : undefined,
      }}>
      {children}
    </Link>
  )
}

function DomainGroup({ domain, defaultOpen, children }: { domain: DomainData; defaultOpen: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`sidebar-domain-${domain.slug}`)
      if (stored !== null) setOpen(stored === '1')
    } catch {}
  }, [domain.slug])

  function toggle() {
    const next = !open
    setOpen(next)
    try { localStorage.setItem(`sidebar-domain-${domain.slug}`, next ? '1' : '0') } catch {}
  }

  return (
    <div className="mb-1">
      <div className="group flex items-center gap-1 px-2 py-1 cursor-pointer rounded-md hover:bg-[var(--surface-hover)]"
        onClick={toggle}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
          className="shrink-0 transition-transform duration-150"
          style={{ color: 'var(--text-tertiary)', transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          <path d="M3 1.5L7 5L3 8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[10px] font-semibold uppercase tracking-widest flex-1"
          style={{ color: 'var(--text-tertiary)' }}>
          {domain.name}
        </span>
        <Link href={`/domain/${domain.slug}/edit`} onClick={e => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-[var(--border)]"
          title="Editar dominio">
          <EditIcon />
        </Link>
      </div>
      {open && <div className="mt-0.5 space-y-px">{children}</div>}
    </div>
  )
}

function SpaceLink({ space, domainColor, onNavigate }: { space: SpaceData; domainColor: string; onNavigate?: () => void }) {
  const pathname = usePathname()
  const href = `/space/${space.slug}`
  const isActive = pathname === href
  const color = space.color || domainColor

  return (
    <div className="group flex items-center">
      <Link href={href} onClick={onNavigate}
        className="flex-1 min-w-0 flex items-center gap-2 pl-5 pr-1 py-1 rounded-md text-[13px] no-underline hover:bg-[var(--surface-hover)]"
        style={{
          color: isActive ? 'var(--text)' : 'var(--text-secondary)',
          fontWeight: isActive ? 500 : 400,
          background: isActive ? 'var(--surface-hover)' : undefined,
        }}>
        <HexIcon color={color} />
        <span className="flex-1 min-w-0 truncate">{space.name}</span>
        <span className="shrink-0 min-w-[20px] text-right text-[11px] tabular-nums"
          style={{ color: 'var(--text-tertiary)' }}>{space._count.tasks}</span>
      </Link>
      <Link href={`/space/${space.slug}/edit`}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 mr-1 rounded hover:bg-[var(--border)]"
        title="Editar espacio">
        <EditIcon />
      </Link>
    </div>
  )
}

/* ─── Icons ─── */

function HexIcon({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <path d="M7 1.5L12 4.25V9.75L7 12.5L2 9.75V4.25L7 1.5Z" stroke={color} strokeWidth="1" strokeLinejoin="round" />
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

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
      strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M1.5 5.5L7 1l5.5 4.5V12a1 1 0 01-1 1h-9a1 1 0 01-1-1V5.5z" />
      <path d="M5 13V8h4v5" />
    </svg>
  )
}

function TasksIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor"
      strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="7" cy="7" r="5.5" />
      <path d="M4.5 7l2 2 3-3.5" />
    </svg>
  )
}
