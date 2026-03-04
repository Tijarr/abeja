'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FAB() {
  return (
    <Button
      data-new-capture="true"
      aria-label="Nueva captura"
      size="icon"
      className="md:hidden fixed z-40 bottom-6 right-4 h-14 w-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
    >
      <Plus className="h-7 w-7" strokeWidth={1.5} />
    </Button>
  )
}
