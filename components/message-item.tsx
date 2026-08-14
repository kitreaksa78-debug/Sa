'use client'

import type { FileUIPart, UIMessage } from 'ai'
import { Sparkles } from 'lucide-react'
import { Markdown } from '@/components/markdown'

function getText(message: UIMessage): string {
  return message.parts
    .map((part) => (part.type === 'text' ? part.text : ''))
    .join('')
}

function getImages(message: UIMessage): FileUIPart[] {
  return message.parts.filter(
    (part): part is FileUIPart =>
      part.type === 'file' && part.mediaType.startsWith('image/'),
  )
}

export function MessageItem({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'
  const text = getText(message)
  const images = isUser ? getImages(message) : []

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[85%] flex-col items-end gap-2">
          {images.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              {images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${img.url}-${i}`}
                  src={img.url}
                  alt={img.filename ?? 'Uploaded image'}
                  className="max-h-48 rounded-2xl rounded-br-lg border border-border object-cover"
                />
              ))}
            </div>
          )}
          {text && (
            <div className="rounded-3xl rounded-br-lg bg-secondary px-4 py-2.5 text-[15px] leading-7 text-secondary-foreground whitespace-pre-wrap">
              {text}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Sparkles className="size-4" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <Markdown content={text} />
      </div>
    </div>
  )
}

export function ThinkingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Sparkles className="size-4" />
      </div>
      <div className="flex items-center gap-1.5 pt-2.5">
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
        <span className="size-2 animate-bounce rounded-full bg-muted-foreground" />
      </div>
    </div>
  )
}
