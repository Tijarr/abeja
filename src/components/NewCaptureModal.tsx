'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface SpaceOption {
  slug: string
  name: string
  color: string | null
}

export default function NewCaptureModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [body, setBody] = useState('')
  const [space, setSpace] = useState<string>('sandbox')
  const [loading, setLoading] = useState(false)
  const [spaces, setSpaces] = useState<SpaceOption[]>([])

  useEffect(() => {
    fetch('/api/spaces')
      .then(r => r.json())
      .then(data => {
        if (data.spaces?.length) {
          setSpaces(data.spaces)
          const sb = data.spaces.find((s: SpaceOption) => s.slug === 'sandbox')
          if (sb) setSpace(sb.slug)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)
    try {
      await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, space }),
      })
      setBody('')
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to create task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.ctrlKey && e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('[data-new-capture]')) setIsOpen(true)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false) }}
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSubmit}
            className="rounded-xl p-6 w-full max-w-md shadow-xl"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <textarea
              autoFocus
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe la tarea..."
              rows={5}
              className="w-full p-3 rounded-lg mb-4 resize-none text-[14px] outline-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />

            <div className="mb-5">
              <span className="block text-[11px] mb-2" style={{ color: 'var(--text-tertiary)' }}>Espacio</span>
              <select
                value={space}
                onChange={(e) => setSpace(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                {spaces.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 py-2 rounded-lg text-[13px] transition-opacity hover:opacity-70"
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !body.trim()}
                className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: 'var(--text)', color: 'var(--bg)' }}
              >
                {loading ? 'Guardando...' : 'Crear tarea'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
