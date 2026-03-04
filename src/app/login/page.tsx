'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

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
        <p className="text-[13px] mb-8 text-muted-foreground">Ingresa la contraseña para continuar</p>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={pw}
            onChange={e => { setPw(e.target.value); setErr(false) }}
            placeholder="Contraseña"
            autoFocus
            className={err ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
        </div>
        {err && (
          <p className="flex items-center gap-1.5 text-xs mt-2 text-destructive">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            Contraseña inválida
          </p>
        )}

        <Button type="submit" className="w-full mt-4" variant="secondary">
          Continuar
        </Button>
      </form>
    </div>
  )
}
