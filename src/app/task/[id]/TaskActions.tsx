'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TaskActions({ taskId, status, spaceName }: { taskId: number; status: string; spaceName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const isOpen = status === 'open'

  async function toggleStatus() {
    setLoading('status')
    const newStatus = isOpen ? 'done' : 'open'
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
      <button
        onClick={toggleStatus}
        disabled={loading === 'status'}
        className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-opacity hover:opacity-85 disabled:opacity-40"
        style={{
          background: isOpen ? 'rgba(107, 201, 160, 0.15)' : 'rgba(232, 171, 94, 0.15)',
          color: isOpen ? '#6bc9a0' : 'var(--accent)',
        }}
      >
        {loading === 'status' ? '...' : isOpen ? '✓ Completar' : '↺ Reabrir'}
      </button>

      {!showConfirm ? (
        <button
          onClick={() => setShowConfirm(true)}
          className="px-3 py-1.5 rounded-md text-[12px] transition-opacity hover:opacity-85"
          style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-tertiary)' }}
        >
          Eliminar
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-[12px]" style={{ color: '#d4636c' }}>¿Seguro?</span>
          <button
            onClick={deleteTask}
            disabled={loading === 'delete'}
            className="px-3 py-1.5 rounded-md text-[12px] font-medium transition-opacity hover:opacity-85 disabled:opacity-40"
            style={{ background: 'rgba(212, 99, 108, 0.15)', color: '#d4636c' }}
          >
            {loading === 'delete' ? '...' : 'Sí, eliminar'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-3 py-1.5 rounded-md text-[12px] transition-opacity hover:opacity-85"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-tertiary)' }}
          >
            No
          </button>
        </div>
      )}
    </div>
  )
}
