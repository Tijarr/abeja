'use client'

import TaskRow from '@/components/TaskRow'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { MoreHorizontal } from 'lucide-react'

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

export function InboxTabs({ active, delegated, done }: {
  active: TaskData[]
  delegated: TaskData[]
  done: TaskData[]
}) {
  return (
    <Tabs defaultValue="active">
      <TabsList variant="line" className="mb-3">
        <TabsTrigger value="active" className="text-[13px]">
          Activas ({active.length})
        </TabsTrigger>
        <TabsTrigger value="delegated" className="text-[13px]">
          Delegadas ({delegated.length})
        </TabsTrigger>
        <TabsTrigger value="done" className="text-[13px]">
          Finalizadas ({done.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active">
        <TaskListSection label="Activas" tasks={active} />
      </TabsContent>
      <TabsContent value="delegated">
        <TaskListSection label="Delegadas" tasks={delegated} />
      </TabsContent>
      <TabsContent value="done">
        <TaskListSection label="Finalizadas" tasks={done} done />
      </TabsContent>
    </Tabs>
  )
}

function TaskListSection({ label, tasks, done = false }: {
  label: string
  tasks: TaskData[]
  done?: boolean
}) {
  return (
    <>
      <div className="flex items-center gap-2 mb-2 py-1">
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground" aria-label="Opciones">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        <span className="text-[13px] font-medium text-muted-foreground">
          Tareas {label}
        </span>
        <span className="text-[13px] text-muted-foreground">
          {tasks.length}
        </span>
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
            done={done || t.status === 'done'}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-[13px] text-muted-foreground">
            Sin tareas {label.toLowerCase()}
          </p>
          <p className="text-[11px] mt-1 text-muted-foreground">
            Usa ⌘K para crear una nueva tarea
          </p>
        </div>
      )}
    </>
  )
}
