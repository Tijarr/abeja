'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const COLORS = ['#6bc9a0', '#d4636c', '#bb87fc', '#e07eb4', '#4ea8db', '#e8ab5e', '#8b9ab0', '#d4a0e0', '#7cb3f4', '#f0c674']

export default function DomainEditForm({ slug, name, description, color, spaceCount }: {
  slug: string; name: string; description: string; color: string; spaceCount: number
}) {
  const router = useRouter()
  const [formName, setFormName] = useState(name)
  const [formSlug, setFormSlug] = useState(slug)
  const [formDesc, setFormDesc] = useState(description)
  const [formColor, setFormColor] = useState(color)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const slugChanged = formSlug !== slug

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch(`/api/domains/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          slug: slugChanged ? formSlug : undefined,
          description: formDesc,
          color: formColor,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error === 'slug already in use' ? 'Ese slug ya existe' : data.error)
      } else {
        setMessage('Guardado')
        if (data.slugChanged) {
          router.push(`/domain/${formSlug}/edit`)
        } else {
          router.refresh()
        }
      }
    } catch {
      setMessage('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: formColor }} />
          <input
            type="text"
            value={formName}
            onChange={e => setFormName(e.target.value)}
            className="text-[22px] font-semibold tracking-tight bg-transparent outline-none w-full text-foreground rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background px-1 -ml-1"
            placeholder="Nombre del dominio"
          />
        </div>
        <p className="text-[11px] ml-6 text-muted-foreground">
          {spaceCount} espacio{spaceCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Slug */}
      <div className="mb-6">
        <Label className="text-[11px] mb-1.5 text-muted-foreground">
          Slug (URL)
        </Label>
        <div className="flex items-center gap-0 rounded-lg overflow-hidden border border-border">
          <span className="px-3 py-2 text-[13px] shrink-0 bg-background text-muted-foreground">
            /domain/
          </span>
          <Input
            type="text"
            value={formSlug}
            onChange={e => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="flex-1 border-0 rounded-none text-[13px] focus-visible:ring-0"
          />
        </div>
        {slugChanged && (
          <p className="text-[11px] mt-1.5 px-1 text-primary">
            El slug anterior /{slug} redirigirá automáticamente al nuevo
          </p>
        )}
      </div>

      {/* Color */}
      <div className="mb-6">
        <Label className="text-[11px] mb-2 text-muted-foreground">
          Color
        </Label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} onClick={() => setFormColor(c)}
              className={cn(
                'w-7 h-7 rounded-full transition-transform hover:scale-110',
                formColor === c ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : '',
              )}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <Label className="text-[11px] mb-1.5 text-muted-foreground">
          Contexto (markdown)
        </Label>
        <Textarea
          value={formDesc}
          onChange={e => setFormDesc(e.target.value)}
          rows={8}
          placeholder="Describe este dominio. Este texto sirve como contexto para ti y para agentes IA..."
          className="text-[13px] leading-relaxed resize-y bg-background border-border"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={saving || !formName.trim() || !formSlug.trim()}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        {message && (
          <span className={cn(
            'text-xs',
            message === 'Guardado' ? 'text-primary' : 'text-destructive',
          )}>
            {message}
          </span>
        )}
      </div>
    </div>
  )
}
