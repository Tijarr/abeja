'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface SpaceOption {
  slug: string
  name: string
  color: string | null
}

const TASK_TYPES = [
  { value: 'normal', label: 'Normal' },
  { value: 'seguimiento', label: 'Seguimiento' },
  { value: 'investigacion', label: 'Investigación' },
  { value: 'desarrollo', label: 'Desarrollo' },
  { value: 'compra', label: 'Compra' },
]

export default function NewCaptureModal() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [body, setBody] = useState('')
  const [space, setSpace] = useState<string>('sandbox')
  const [type, setType] = useState('normal')
  const [tagsInput, setTagsInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [spaces, setSpaces] = useState<SpaceOption[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  // Pre-select space from current URL
  useEffect(() => {
    if (!isOpen || spaces.length === 0) return
    const match = pathname.match(/^\/space\/([^/]+)/)
    if (match) {
      const slug = match[1]
      if (spaces.some(s => s.slug === slug)) {
        setSpace(slug)
      }
    }
  }, [isOpen, pathname, spaces])

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Focus textarea on open
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }, [isOpen])

  const resetForm = () => {
    setBody('')
    setType('normal')
    setTagsInput('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean)

    try {
      await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, space, type, tags }),
      })
      resetForm()
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
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  // Listen for data-new-capture clicks
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
          className="fixed inset-0 flex items-start justify-center z-50 pt-[15vh]"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false) }}
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSubmit}
            className="rounded-xl p-5 w-full max-w-md shadow-xl"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
          >
            <textarea
              ref={textareaRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe la tarea..."
              rows={4}
              className="w-full p-3 rounded-lg mb-3 resize-none text-[14px] outline-none"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
            />

            {/* Space + Type row */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <span className="block text-[10px] mb-1 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Espacio</span>
                <select
                  value={space}
                  onChange={(e) => setSpace(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-md text-[12px] outline-none"
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
              <div className="flex-1">
                <span className="block text-[10px] mb-1 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Tipo</span>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-md text-[12px] outline-none"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  {TASK_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="mb-4">
              <span className="block text-[10px] mb-1 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Tags</span>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="urgente, diseño, backend..."
                className="w-full px-2 py-1.5 rounded-md text-[12px] outline-none"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { resetForm(); setIsOpen(false) }}
                className="flex-1 py-2 rounded-lg text-[12px] border-none cursor-pointer transition-opacity hover:opacity-70"
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !body.trim()}
                className="flex-1 py-2 rounded-lg text-[12px] font-medium border-none cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-40"
                style={{ background: 'var(--accent)', color: '#0a0a0a' }}
              >
                {loading ? 'Guardando...' : 'Crear tarea'}
              </button>
            </div>

            <p className="text-center text-[10px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
              ⌘K para abrir · ⌘Enter para crear
            </p>
          </form>
        </div>
      )}
    </>
  )
}
