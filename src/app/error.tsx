'use client'

import { Button } from '@/components/ui/button'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <p className="text-[15px] font-semibold mb-2 text-foreground">
        Algo salió mal
      </p>
      <p className="text-[13px] mb-4 text-center text-muted-foreground">
        Ocurrió un error inesperado. Intenta de nuevo.
      </p>
      <Button onClick={reset} size="sm">
        Reintentar
      </Button>
    </div>
  )
}
