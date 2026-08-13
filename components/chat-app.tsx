'use client'

import { useCallback, useState } from 'react'
import type { UIMessage } from 'ai'
import { PanelLeft, Plus } from 'lucide-react'
import { ChatSidebar, type ConversationMeta } from '@/components/chat-sidebar'
import { ChatConversation } from '@/components/chat-conversation'
import { ModelSelector } from '@/components/model-selector'
import { DEFAULT_MODEL } from '@/lib/models'

type Conversation = {
  id: string
  title: string
  messages: UIMessage[]
}

function createId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)
}

function newConversation(): Conversation {
  return { id: createId(), title: 'New chat', messages: [] }
}

function deriveTitle(messages: UIMessage[]): string | null {
  const firstUser = messages.find((m) => m.role === 'user')
  if (!firstUser) return null
  const text = firstUser.parts
    .map((p) => (p.type === 'text' ? p.text : ''))
    .join('')
    .trim()
  if (!text) return null
  return text.length > 40 ? `${text.slice(0, 40)}…` : text
}

export function ChatApp() {
  const [conversations, setConversations] = useState<Conversation[]>(() => [
    newConversation(),
  ])
  const [activeId, setActiveId] = useState(() => conversations[0].id)
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const active =
    conversations.find((c) => c.id === activeId) ?? conversations[0]

  const handleMessagesChange = useCallback(
    (id: string, messages: UIMessage[]) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c
          const title =
            c.title === 'New chat' ? (deriveTitle(messages) ?? c.title) : c.title
          return { ...c, messages, title }
        }),
      )
    },
    [],
  )

  const handleNew = useCallback(() => {
    setConversations((prev) => {
      // Reuse an existing empty "New chat" instead of stacking blanks
      const empty = prev.find((c) => c.messages.length === 0)
      if (empty) {
        setActiveId(empty.id)
        return prev
      }
      const conv = newConversation()
      setActiveId(conv.id)
      return [conv, ...prev]
    })
    setSidebarOpen(false)
  }, [])

  const handleSelect = useCallback((id: string) => {
    setActiveId(id)
    setSidebarOpen(false)
  }, [])

  const handleDelete = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id)
        const list = next.length ? next : [newConversation()]
        if (id === activeId) setActiveId(list[0].id)
        return list
      })
    },
    [activeId],
  )

  const meta: ConversationMeta[] = conversations.map((c) => ({
    id: c.id,
    title: c.title,
  }))

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <ChatSidebar
        conversations={meta}
        activeId={activeId}
        open={sidebarOpen}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-1 px-3 py-2.5">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-accent md:hidden"
            aria-label="Open sidebar"
          >
            <PanelLeft className="size-5" />
          </button>
          <ModelSelector value={model} onChange={setModel} />
          <button
            type="button"
            onClick={handleNew}
            className="ml-auto rounded-lg p-2 text-muted-foreground hover:bg-accent md:hidden"
            aria-label="New chat"
          >
            <Plus className="size-5" />
          </button>
        </header>

        <ChatConversation
          key={active.id}
          conversationId={active.id}
          initialMessages={active.messages}
          model={model}
          onMessagesChange={handleMessagesChange}
        />
      </div>
    </div>
  )
}
