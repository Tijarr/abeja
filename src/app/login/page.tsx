'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.push('/')
      router.refresh()
    } else {
      setError(true)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-[#111] border border-[#222] rounded-xl p-8 w-80">
        <h1 className="text-2xl font-bold text-center mb-6">🐝 Abeja</h1>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false) }}
          placeholder="Contraseña"
          className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3 text-white placeholder-[#666] focus:outline-none focus:border-[#f5c518] mb-4"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-4">Contraseña incorrecta</p>}
        <button type="submit" className="w-full bg-[#f5c518] text-black font-semibold rounded-lg py-3 hover:bg-[#e0b015] transition">
          Entrar
        </button>
      </form>
    </div>
  )
}
