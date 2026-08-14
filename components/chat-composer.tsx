'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowUp, ImagePlus, Square, X } from 'lucide-react'
import type { FileUIPart } from 'ai'

const MAX_IMAGE_SIZE = 8 * 1024 * 1024 // 8 MB
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

type SelectedImage = {
  id: string
  file: FileUIPart
  previewUrl: string
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function ChatComposer({
  onSend,
  onStop,
  isStreaming,
}: {
  onSend: (text: string, files?: FileUIPart[]) => void
  onStop: () => void
  isStreaming: boolean
}) {
  const [input, setInput] = useState('')
  const [images, setImages] = useState<SelectedImage[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [input])

  function submit() {
    const text = input.trim()
    if ((!text && images.length === 0) || isStreaming) return
    const files = images.length > 0 ? images.map((i) => i.file) : undefined
    onSend(text, files)
    setInput('')
    clearImages()
  }

  function clearImages() {
    images.forEach((i) => URL.revokeObjectURL(i.previewUrl))
    setImages([])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const target = prev.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((i) => i.id !== id)
    })
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return
    const newImages: SelectedImage[] = []
    for (const file of Array.from(fileList)) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) continue
      if (file.size > MAX_IMAGE_SIZE) continue
      try {
        const dataUrl = await readFileAsDataUrl(file)
        newImages.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          previewUrl: URL.createObjectURL(file),
          file: { type: 'file', mediaType: file.type, url: dataUrl, filename: file.name },
        })
      } catch {
        // Skip files that fail to read
      }
    }
    if (newImages.length > 0) setImages((prev) => [...prev, ...newImages])
    if (fileInputRef.current) fileInputRef.current.value = ''
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
      {images.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {images.map((img) => (
            <div key={img.id} className="group relative size-16 overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.previewUrl}
                alt={img.file.filename ?? 'Selected image'}
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute right-0.5 top-0.5 flex size-5 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2 rounded-3xl border border-border bg-card p-2 pl-4 shadow-sm focus-within:border-primary/60">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isStreaming}
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
          aria-label="Attach image"
        >
          <ImagePlus className="size-5" />
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={images.length > 0 ? 'Describe what you want to know about the image...' : 'Message ChatGPT...'}
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
            disabled={!input.trim() && images.length === 0}
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
