'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { Inbox, ChevronRight, Pencil, Plus } from 'lucide-react'

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
}: {
  domains: DomainData[]
  inboxCount: number
}) {
  const pathname = usePathname()

  return (
    <Sidebar side="left" collapsible="offcanvas">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/" className="flex items-center h-10 px-2">
          <span className="text-[15px] font-semibold tracking-tight text-primary">ABEJA.CO</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Inbox */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === '/'} tooltip="Inbox">
                <Link href="/">
                  <Inbox className="h-4 w-4" />
                  <span>Inbox</span>
                </Link>
              </SidebarMenuButton>
              <SidebarMenuBadge className="bg-primary/10 text-primary rounded-full px-1.5">
                {inboxCount}
              </SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Domains */}
        {domains.map((domain, i) => {
          const spacesWithTasks = domain.spaces.filter(s => s._count.tasks > 0)
          if (spacesWithTasks.length === 0) return null
          return (
            <DomainGroup key={domain.id} domain={domain} defaultOpen={i < 3} pathname={pathname}>
              {spacesWithTasks.map(space => (
                <SpaceItem key={space.id} space={space} domainColor={domain.color} pathname={pathname} />
              ))}
            </DomainGroup>
          )
        })}
      </SidebarContent>

      <SidebarSeparator />
      <SidebarFooter>
        <Button className="w-full gap-1.5" size="sm" data-new-capture="true">
          <Plus className="h-3.5 w-3.5" />
          Nueva tarea
        </Button>
        <div className="px-1 py-1 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--abeja-status-active)] animate-[pulse-dot_2s_ease-in-out_infinite] shrink-0" />
          <span className="text-[11px] text-muted-foreground">Sistema Activo</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function DomainGroup({ domain, defaultOpen, pathname, children }: {
  domain: DomainData
  defaultOpen: boolean
  pathname: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`sidebar-domain-${domain.slug}`)
      if (stored !== null) setOpen(stored === '1')
    } catch {}
  }, [domain.slug])

  function toggle(next: boolean) {
    setOpen(next)
    try { localStorage.setItem(`sidebar-domain-${domain.slug}`, next ? '1' : '0') } catch {}
  }

  return (
    <Collapsible open={open} onOpenChange={toggle} className="group/collapsible">
      <SidebarGroup className="py-0">
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full items-center gap-1 cursor-pointer">
            <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[state=open]/collapsible:rotate-90" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {domain.name}
            </span>
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <SidebarGroupAction asChild>
          <Link href={`/domain/${domain.slug}/edit`} aria-label={`Editar ${domain.name}`}>
            <Pencil className="h-3 w-3" />
          </Link>
        </SidebarGroupAction>
        <CollapsibleContent>
          <SidebarMenu>
            {children}
          </SidebarMenu>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  )
}

function SpaceItem({ space, domainColor, pathname }: {
  space: SpaceData
  domainColor: string
  pathname: string
}) {
  const href = `/space/${space.slug}`
  const isActive = pathname === href
  const color = space.color || domainColor

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} size="sm" tooltip={space.name}>
        <Link href={href}>
          <span className="shrink-0 w-2 h-2 rounded-full" style={{ background: color }} />
          <span>{space.name}</span>
        </Link>
      </SidebarMenuButton>
      <SidebarMenuBadge className="text-[11px] text-muted-foreground">
        {space._count.tasks}
      </SidebarMenuBadge>
    </SidebarMenuItem>
  )
}
