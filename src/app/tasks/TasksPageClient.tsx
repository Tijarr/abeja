'use client'

import { useRouter } from 'next/navigation'
import TaskRow from '@/components/TaskRow'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type TaskData = {
  id: number
  title: string | null
  body: string
  priority: string
  createdAt: Date
  assignee: string | null
  deadline: Date | null
  status: string | null
}

type SpaceData = {
  slug: string
  name: string
  domain: { name: string }
}

export function TasksPageClient({ tasks, spaces, statusFilter, currentSpace, currentQuery }: {
  tasks: TaskData[]
  spaces: SpaceData[]
  statusFilter: string
  currentSpace: string
  currentQuery: string
}) {
  const router = useRouter()

  function navigate(params: { status?: string; space?: string; q?: string }) {
    const p = new URLSearchParams()
    const s = params.status ?? statusFilter
    if (s && s !== 'active') p.set('status', s)
    const sp = params.space ?? currentSpace
    if (sp) p.set('space', sp)
    const q = params.q ?? currentQuery
    if (q) p.set('q', q)
    const qs = p.toString()
    router.push(`/tasks${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="px-4 md:px-8 pb-10">
      <div className="h-[52px] flex items-center gap-2.5">
        <span className="text-[15px] font-semibold text-foreground">Tareas</span>
        <span className="text-xs font-mono text-muted-foreground">{tasks.length}</span>
      </div>

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <Tabs value={statusFilter} onValueChange={(v) => navigate({ status: v })}>
          <TabsList variant="line">
            <TabsTrigger value="active" className="text-[13px]">Activas</TabsTrigger>
            <TabsTrigger value="delegated" className="text-[13px]">Delegadas</TabsTrigger>
            <TabsTrigger value="done" className="text-[13px]">Finalizadas</TabsTrigger>
            <TabsTrigger value="all" className="text-[13px]">Todas</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <form onSubmit={(e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            navigate({ q: fd.get('q') as string })
          }} className="flex items-center gap-2">
            <Input name="q" defaultValue={currentQuery} placeholder="Buscar..."
              className="h-7 w-40 text-xs" />
            <Button type="submit" size="sm" className="h-7 text-[11px]">
              Filtrar
            </Button>
          </form>

          <Select value={currentSpace} onValueChange={(v) => navigate({ space: v })}>
            <SelectTrigger size="sm" className="h-7 text-xs w-[160px]">
              <SelectValue placeholder="Todos los espacios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">Todos</SelectItem>
              {spaces.map(s => (
                <SelectItem key={s.slug} value={s.slug}>
                  {s.domain.name} / {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        {tasks.map(t => (
          <TaskRow
            key={t.id}
            id={t.id}
            title={t.body || t.title || ''}
            priority={t.priority}
            createdAt={t.createdAt}
            assignee={t.assignee}
            deadline={t.deadline}
            done={t.status === 'done'}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[13px] text-muted-foreground">Sin tareas</p>
        </div>
      )}
    </div>
  )
}
