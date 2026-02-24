'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw })
    })
    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setErr(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-[320px]">
        <h1 className="text-[22px] font-semibold tracking-tight mb-1">Abeja</h1>
        <p className="text-[13px] mb-8" style={{ color: 'var(--text-tertiary)' }}>Enter password to continue</p>
        
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(false) }}
          placeholder="Password"
          autoFocus
          className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none transition-colors"
          style={{
            background: 'var(--surface)',
            border: `1px solid ${err ? '#d4636c' : 'var(--border)'}`,
            color: 'var(--text)',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = err ? '#d4636c' : 'var(--border-hover)'}
          onBlur={(e) => e.currentTarget.style.borderColor = err ? '#d4636c' : 'var(--border)'}
        />
        {err && <p className="text-[12px] mt-2" style={{ color: '#d4636c' }}>Invalid password</p>}
        
        <button type="submit"
          className="w-full mt-4 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-opacity hover:opacity-90"
          style={{ background: 'var(--text)', color: 'var(--bg)' }}
        >
          Continue
        </button>
      </form>
    </div>
  )
}
