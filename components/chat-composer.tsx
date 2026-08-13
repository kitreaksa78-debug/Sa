'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowUp, Square } from 'lucide-react'

export function ChatComposer({
  onSend,
  onStop,
  isStreaming,
}: {
  onSend: (text: string) => void
  onStop: () => void
  isStreaming: boolean
}) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  function submit() {
    const text = input.trim()
    if (!text || isStreaming) return
    onSend(text)
    setInput('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Respect IME composition (CJK input) and Safari's 229 keyCode quirk
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      <div className="flex items-end gap-2 rounded-3xl border border-border bg-card p-2 pl-4 shadow-sm focus-within:border-primary/60">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Message ChatGPT..."
          className="max-h-[200px] flex-1 resize-none bg-transparent py-2.5 text-[15px] leading-6 text-foreground outline-none placeholder:text-muted-foreground"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-80"
            aria-label="Stop generating"
          >
            <Square className="size-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!input.trim()}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-30"
            aria-label="Send message"
          >
            <ArrowUp className="size-5" />
          </button>
        )}
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        AI can make mistakes. Consider checking important information.
      </p>
    </div>
  )
}
