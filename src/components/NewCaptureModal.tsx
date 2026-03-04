'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { PRIORITY_VALUES, PRIORITY_LABELS, PRIORITY_COLORS, type Priority } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  const [priority, setPriority] = useState<Priority>('normal')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
    setPriority('normal')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)
    setError(null)

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean)

    try {
      const res = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body, space, type, tags, priority }),
      })
      if (!res.ok) throw new Error('Server error')
      resetForm()
      setIsOpen(false)
      router.refresh()
    } catch {
      setError('Error al crear la tarea. Intenta de nuevo.')
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
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsOpen(open) }}>
      <DialogContent className="bg-background border-border p-5 max-w-md">
        <DialogTitle className="sr-only">Nueva tarea</DialogTitle>
        <form onSubmit={handleSubmit}>
          <Textarea
            ref={textareaRef}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe la tarea..."
            rows={4}
            className="mb-3 resize-none bg-card border-border text-sm"
          />

          {/* Space + Type row */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <Label className="text-[10px] mb-1 uppercase tracking-wider text-muted-foreground">Espacio</Label>
              <select
                value={space}
                onChange={(e) => setSpace(e.target.value)}
                className="w-full px-2 py-1.5 rounded-md text-xs bg-card border border-border text-foreground outline-none"
              >
                {spaces.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <Label className="text-[10px] mb-1 uppercase tracking-wider text-muted-foreground">Tipo</Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-2 py-1.5 rounded-md text-xs bg-card border border-border text-foreground outline-none"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority row */}
          <div className="mb-3">
            <Label className="text-[10px] mb-1 uppercase tracking-wider text-muted-foreground">Prioridad</Label>
            <div className="flex gap-1">
              {PRIORITY_VALUES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  aria-label={`Prioridad ${PRIORITY_LABELS[p]}`}
                  aria-pressed={priority === p}
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] transition-all cursor-pointer border-none',
                    priority === p ? 'bg-secondary' : 'bg-transparent hover:bg-secondary/50',
                  )}
                  style={{
                    color: priority === p ? PRIORITY_COLORS[p] : 'var(--muted-foreground)',
                    outline: priority === p ? `1px solid ${PRIORITY_COLORS[p]}40` : '1px solid transparent',
                  }}
                >
                  <span
                    className="inline-block shrink-0 w-2 h-2 rotate-45 rounded-[1px]"
                    aria-hidden="true"
                    style={{
                      background: PRIORITY_COLORS[p],
                      opacity: priority === p ? 1 : 0.4,
                    }}
                  />
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <Label className="text-[10px] mb-1 uppercase tracking-wider text-muted-foreground">Tags</Label>
            <Input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="urgente, diseño, backend..."
              className="text-xs bg-card border-border"
            />
          </div>

          {error && (
            <p className="text-xs mb-3 px-2 py-1.5 rounded-md text-destructive bg-destructive/10">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => { resetForm(); setIsOpen(false) }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !body.trim()}
              className="flex-1"
            >
              {loading ? 'Guardando...' : 'Crear tarea'}
            </Button>
          </div>

          <p className="text-center text-[10px] mt-2 text-muted-foreground">
            ⌘K para abrir · ⌘Enter para crear
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
