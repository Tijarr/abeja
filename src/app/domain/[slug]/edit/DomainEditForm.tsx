'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
            className="text-[22px] font-semibold tracking-tight bg-transparent outline-none w-full"
            style={{ color: 'var(--text)' }}
            placeholder="Nombre del dominio"
          />
        </div>
        <p className="text-[11px] ml-6" style={{ color: 'var(--text-tertiary)' }}>
          {spaceCount} espacio{spaceCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Slug */}
      <div className="mb-6">
        <label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
          Slug (URL)
        </label>
        <div className="flex items-center gap-0 rounded-lg overflow-hidden"
          style={{ border: '1px solid var(--border)' }}>
          <span className="px-3 py-2 text-[13px] shrink-0" style={{ background: 'var(--bg)', color: 'var(--text-tertiary)' }}>
            /domain/
          </span>
          <input
            type="text"
            value={formSlug}
            onChange={e => setFormSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
            className="flex-1 px-2 py-2 text-[13px] bg-transparent outline-none"
            style={{ color: 'var(--text)' }}
          />
        </div>
        {slugChanged && (
          <p className="text-[11px] mt-1.5 px-1" style={{ color: 'var(--accent)' }}>
            El slug anterior /{slug} redirigira automaticamente al nuevo
          </p>
        )}
      </div>

      {/* Color */}
      <div className="mb-6">
        <label className="block text-[11px] font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
          Color
        </label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} onClick={() => setFormColor(c)}
              className="w-7 h-7 rounded-full transition-transform hover:scale-110"
              style={{
                background: c,
                outline: formColor === c ? '2px solid var(--text)' : '2px solid transparent',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="mb-8">
        <label className="block text-[11px] font-medium mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
          Contexto (markdown)
        </label>
        <textarea
          value={formDesc}
          onChange={e => setFormDesc(e.target.value)}
          rows={8}
          placeholder="Describe este dominio. Este texto sirve como contexto para ti y para agentes IA..."
          className="w-full p-3 rounded-lg text-[13px] leading-relaxed resize-y outline-none"
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !formName.trim() || !formSlug.trim()}
          className="px-4 py-2 rounded-lg text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ background: 'var(--accent)', color: '#0a0a0a' }}
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg text-[13px] transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-secondary)' }}
        >
          Cancelar
        </button>
        {message && (
          <span className="text-[12px]"
            style={{ color: message === 'Guardado' ? '#6bc9a0' : '#d4636c' }}>
            {message}
          </span>
        )}
      </div>
    </div>
  )
}
