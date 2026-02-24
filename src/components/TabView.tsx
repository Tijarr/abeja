'use client'
import { useState } from 'react'

type Tab = 'tareas' | 'contexto'

interface TabViewProps {
  tareas: React.ReactNode
  contexto: React.ReactNode
  tareasCount?: number
  contextoCount?: number
}

export default function TabView({ tareas, contexto, tareasCount, contextoCount }: TabViewProps) {
  const [active, setActive] = useState<Tab>('tareas')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-5" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
        {(['tareas', 'contexto'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className="px-3 py-2 text-[13px] font-medium capitalize transition-colors relative"
            style={{
              color: active === tab ? 'var(--text)' : 'var(--text-tertiary)',
              borderBottom: active === tab ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: '-1px',
              background: 'none',
              cursor: 'pointer',
            }}
          >
            {tab}
            {tab === 'tareas' && tareasCount !== undefined && (
              <span className="ml-1.5 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{tareasCount}</span>
            )}
            {tab === 'contexto' && contextoCount !== undefined && (
              <span className="ml-1.5 text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{contextoCount}</span>
            )}
          </button>
        ))}
      </div>
      {/* Content */}
      {active === 'tareas' ? tareas : contexto}
    </div>
  )
}
