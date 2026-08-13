'use client'

import { Lightbulb, Code2, PenLine, GraduationCap } from 'lucide-react'

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    title: 'Brainstorm ideas',
    prompt: 'Give me 5 creative side-project ideas I could build in a weekend.',
  },
  {
    icon: Code2,
    title: 'Write some code',
    prompt: 'Write a TypeScript function that debounces an async function.',
  },
  {
    icon: PenLine,
    title: 'Help me write',
    prompt: 'Draft a friendly out-of-office email for a one-week vacation.',
  },
  {
    icon: GraduationCap,
    title: 'Explain a concept',
    prompt: 'Explain how the Fourier transform works in simple terms.',
  },
]

export function EmptyState({ onPrompt }: { onPrompt: (text: string) => void }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          What can I help with?
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty">
          Ask anything, or start with one of these.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            type="button"
            onClick={() => onPrompt(s.prompt)}
            className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 hover:bg-accent"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
              <s.icon className="size-4.5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">
                {s.title}
              </div>
              <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {s.prompt}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
