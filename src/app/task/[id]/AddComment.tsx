'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Loader2 } from 'lucide-react'

export default function AddComment({ taskId }: { taskId: number }) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)
    await fetch(`/api/task/${taskId}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    setBody('')
    setIsOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground border-dashed"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-3.5 w-3.5 mr-1" />
        Agregar comentario...
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Textarea
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Escribe un comentario..."
        rows={3}
        className="mb-2 resize-none bg-card border-border text-[13px]"
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsOpen(false)
          if (e.ctrlKey && e.key === 'Enter') handleSubmit(e as unknown as React.FormEvent)
        }}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => { setIsOpen(false); setBody('') }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={loading || !body.trim()}
        >
          {loading ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Enviando...</> : 'Comentar'}
        </Button>
      </div>
    </form>
  )
}
