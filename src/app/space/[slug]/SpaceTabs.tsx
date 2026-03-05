'use client'

import TaskRow from '@/components/TaskRow'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

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

export function SpaceTabs({ active, delegated, done }: {
  active: TaskData[]
  delegated: TaskData[]
  done: TaskData[]
}) {
  return (
    <Tabs defaultValue="active">
      <TabsList variant="line" className="mb-3">
        <TabsTrigger value="active" className="text-[13px]">
          Activas <span className="font-mono ml-1">{active.length}</span>
        </TabsTrigger>
        <TabsTrigger value="delegated" className="text-[13px]">
          Delegadas <span className="font-mono ml-1">{delegated.length}</span>
        </TabsTrigger>
        <TabsTrigger value="done" className="text-[13px]">
          Finalizadas <span className="font-mono ml-1">{done.length}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active">
        <TaskList tasks={active} emptyLabel="activas" showHint />
      </TabsContent>
      <TabsContent value="delegated">
        <TaskList tasks={delegated} emptyLabel="delegadas" done={false} />
      </TabsContent>
      <TabsContent value="done">
        <TaskList tasks={done} emptyLabel="finalizadas" done />
      </TabsContent>
    </Tabs>
  )
}

function TaskList({ tasks, emptyLabel, done = false, showHint = false }: {
  tasks: TaskData[]
  emptyLabel: string
  done?: boolean
  showHint?: boolean
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-[13px] text-muted-foreground">
          Sin tareas {emptyLabel}
        </p>
        {showHint && (
          <p className="text-[11px] mt-1 text-muted-foreground">
            Usa + Nueva tarea para crear una
          </p>
        )}
      </div>
    )
  }

  return (
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
  )
}
