'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
      <button
        onClick={() => setIsOpen(true)}
        className="w-full px-3 py-2.5 rounded-lg text-[13px] text-left transition-colors hover:bg-[var(--surface-hover)]"
        style={{ border: '1px dashed var(--border)', color: 'var(--text-tertiary)' }}
      >
        + Agregar comentario...
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Escribe un comentario..."
        rows={3}
        className="w-full p-3 rounded-lg mb-2 resize-none text-[13px] outline-none"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsOpen(false)
          if (e.ctrlKey && e.key === 'Enter') handleSubmit(e as unknown as React.FormEvent)
        }}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setIsOpen(false); setBody('') }}
          className="px-3 py-1.5 rounded-md text-[12px] transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || !body.trim()}
          className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#0a0a0a' }}
        >
          {loading ? '...' : 'Comentar'}
        </button>
      </div>
    </form>
  )
}
