import { cookies } from 'next/headers'

const PASSWORD = process.env.ABEJA_PASSWORD || 'abeja2026'

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get('abeja_auth')?.value === PASSWORD
}
