'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Check, RotateCcw, Trash2, Loader2 } from 'lucide-react'

export default function TaskActions({ taskId, status }: { taskId: number; status: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const isOpen = status === 'active' || status === 'open'

  async function toggleStatus() {
    setLoading('status')
    const newStatus = isOpen ? 'done' : 'active'
    await fetch(`/api/task/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    router.refresh()
    setLoading(null)
  }

  async function deleteTask() {
    setLoading('delete')
    await fetch(`/api/task/${taskId}`, { method: 'DELETE' })
    router.push('/')
  }

  return (
    <div className="flex items-center gap-2 mb-5 flex-wrap">
      <Button
        variant="outline"
        size="sm"
        onClick={toggleStatus}
        disabled={loading === 'status'}
        className={isOpen
          ? 'border-primary/20 text-primary hover:bg-primary/10'
          : 'border-primary/20 text-primary hover:bg-primary/10'
        }
      >
        {loading === 'status' ? (
          <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Procesando...</>
        ) : isOpen ? (
          <><Check className="h-3.5 w-3.5 mr-1" /> Completar</>
        ) : (
          <><RotateCcw className="h-3.5 w-3.5 mr-1" /> Reabrir</>
        )}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Eliminar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La tarea será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteTask}
              disabled={loading === 'delete'}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading === 'delete' ? (
                <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Eliminando...</>
              ) : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
