'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { MODELS } from '@/lib/models'
import { cn } from '@/lib/utils'

export function ModelSelector({
  value,
  onChange,
}: {
  value: string
  onChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = MODELS.find((m) => m.id === value) ?? MODELS[0]

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current.name}
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-20 mt-1.5 w-72 overflow-hidden rounded-xl border border-border bg-popover p-1.5 shadow-lg"
        >
          {MODELS.map((model) => (
            <button
              key={model.id}
              type="button"
              role="option"
              aria-selected={model.id === value}
              onClick={() => {
                onChange(model.id)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent',
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-popover-foreground">
                  {model.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {model.description}
                </div>
              </div>
              {model.id === value && (
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
