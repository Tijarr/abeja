'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Inbox, ChevronRight, Pencil, Plus, Menu } from 'lucide-react'

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
  inboxCount,
  children,
}: {
  domains: DomainData[]
  inboxCount: number
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
      <aside className="hidden md:flex md:w-[220px] md:shrink-0 md:flex-col h-screen overflow-y-auto bg-sidebar border-r border-sidebar-border">
        <SidebarContent domains={domains} inboxCount={inboxCount} />
      </aside>

      {/* Content column: mobile header + main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <header className="md:hidden shrink-0 flex items-center justify-between px-4 py-3 bg-card border-b border-border pt-[max(0.75rem,env(safe-area-inset-top))]">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-1 text-muted-foreground"
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-[18px] w-[18px]" />
          </Button>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold tracking-tight text-primary">
            ABEJA.CO
          </Link>
          <div className="w-10" />
        </header>

        {/* Main */}
        <main className="flex-1 overflow-y-auto min-w-0 overflow-x-clip">
          {children}
        </main>
      </div>

      {/* Mobile drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-sidebar-border pb-[env(safe-area-inset-bottom)]">
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <SidebarContent domains={domains} inboxCount={inboxCount} onNavigate={close} />
        </SheetContent>
      </Sheet>
    </div>
  )
}

/* ─── Sidebar content (pure render, no data fetching) ─── */

function SidebarContent({ domains, inboxCount, onNavigate }: { domains: DomainData[]; inboxCount: number; onNavigate?: () => void }) {
  return (
    <>
      <div className="px-4 h-[52px] flex items-center shrink-0 border-b border-sidebar-border">
        <span className="text-[15px] font-semibold tracking-tight text-primary">ABEJA.CO</span>
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-2 py-2">
          <div className="space-y-px mb-3">
            <NavItemWithCount href="/" count={inboxCount} onNavigate={onNavigate}>
              <Inbox className="h-3.5 w-3.5 shrink-0" /> Inbox
            </NavItemWithCount>
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
      </ScrollArea>

      <Separator />
      <div className="px-2 py-2 shrink-0">
        <Button
          className="w-full gap-1.5"
          size="sm"
          data-new-capture="true"
        >
          <Plus className="h-3.5 w-3.5" />
          Nueva tarea
        </Button>
        <div className="px-1 py-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--abeja-status-active)] animate-[pulse-dot_2s_ease-in-out_infinite] shrink-0" />
          <span className="text-[11px] text-muted-foreground">Sistema Activo</span>
        </div>
      </div>
    </>
  )
}

/* ─── Nav items ─── */

function NavItemWithCount({ href, count, children, onNavigate }: { href: string; count: number; children: React.ReactNode; onNavigate?: () => void }) {
  const pathname = usePathname()
  const isActive = pathname === href
  return (
    <Link href={href} onClick={onNavigate}
      className={cn(
        'flex items-center gap-2 px-2 py-1 rounded-md text-[13px] hover:bg-sidebar-accent',
        isActive ? 'bg-sidebar-accent text-sidebar-foreground font-medium' : 'text-muted-foreground',
      )}>
      {children}
      <span className="ml-auto text-[11px] tabular-nums px-1.5 rounded-full bg-primary/10 text-primary">{count}</span>
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
    <Collapsible open={open} onOpenChange={toggle} className="mb-1">
      <div className="group flex items-center">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="group w-full flex items-center gap-1 px-2 py-1 cursor-pointer rounded-md hover:bg-sidebar-accent border-none bg-transparent"
            aria-controls={`domain-${domain.slug}-spaces`}
          >
            <ChevronRight className={cn(
              'h-2.5 w-2.5 shrink-0 text-muted-foreground transition-transform duration-150',
              open && 'rotate-90',
            )} />
            <span className="text-[10px] font-semibold uppercase tracking-widest flex-1 text-left text-muted-foreground">
              {domain.name}
            </span>
          </button>
        </CollapsibleTrigger>
        <Link href={`/domain/${domain.slug}/edit`} onClick={e => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-border"
          title="Editar dominio">
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </Link>
      </div>
      <CollapsibleContent>
        <div id={`domain-${domain.slug}-spaces`} className="mt-0.5 space-y-px">{children}</div>
      </CollapsibleContent>
    </Collapsible>
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
        className={cn(
          'flex-1 min-w-0 flex items-center gap-2 pl-5 pr-1 py-1 rounded-md text-[13px] hover:bg-sidebar-accent',
          isActive ? 'bg-sidebar-accent text-sidebar-foreground font-medium' : 'text-muted-foreground',
        )}>
        <span className="shrink-0 w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="flex-1 min-w-0 truncate">{space.name}</span>
        <span className="shrink-0 min-w-[20px] text-right text-[11px] tabular-nums px-1.5 rounded-full bg-secondary text-muted-foreground">
          {space._count.tasks}
        </span>
      </Link>
      <Link href={`/space/${space.slug}/edit`}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 mr-1 rounded hover:bg-border"
        title="Editar espacio">
        <Pencil className="h-3 w-3 text-muted-foreground" />
      </Link>
    </div>
  )
}
