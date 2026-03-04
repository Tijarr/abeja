'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center py-20 px-4">
      <Card className="max-w-sm w-full">
        <CardContent className="flex flex-col items-center py-8 px-6">
          <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
          <p className="text-[15px] font-semibold mb-2 text-foreground">
            Algo salió mal
          </p>
          <p className="text-[13px] mb-4 text-center text-muted-foreground">
            Ocurrió un error inesperado. Intenta de nuevo.
          </p>
          <Button onClick={reset} size="sm">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
