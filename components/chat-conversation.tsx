'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { useEffect, useRef } from 'react'
import { RefreshCw, TriangleAlert } from 'lucide-react'
import { MessageItem, ThinkingIndicator } from '@/components/message-item'
import { ChatComposer } from '@/components/chat-composer'
import { EmptyState } from '@/components/empty-state'

export function ChatConversation({
  conversationId,
  initialMessages,
  model,
  onMessagesChange,
}: {
  conversationId: string
  initialMessages: UIMessage[]
  model: string
  onMessagesChange: (id: string, messages: UIMessage[]) => void
}) {
  const modelRef = useRef(model)
  modelRef.current = model

  const { messages, sendMessage, status, stop, error, regenerate } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: () => ({ model: modelRef.current }),
    }),
  })

  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isStreaming = status === 'submitted' || status === 'streaming'
  const isEmpty = messages.length === 0

  // Persist messages up to the parent so conversations survive switching
  useEffect(() => {
    onMessagesChange(conversationId, messages)
  }, [conversationId, messages, onMessagesChange])

  // Auto-scroll to the latest message while streaming
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  const showThinking =
    status === 'submitted' &&
    messages[messages.length - 1]?.role === 'user'

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {isEmpty ? (
        <div className="flex flex-1 flex-col justify-center">
          <EmptyState onPrompt={(text) => sendMessage({ text })} />
        </div>
      ) : (
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            {showThinking && <ThinkingIndicator />}
            {error && (
              <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    Something went wrong generating a response.
                  </p>
                  <p className="mt-1 text-pretty text-muted-foreground">
                    {error.message || 'Please try again in a moment.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => regenerate()}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent"
                  >
                    <RefreshCw className="size-3.5" />
                    Retry
                  </button>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      <ChatComposer
        onSend={(text) => sendMessage({ text })}
        onStop={stop}
        isStreaming={isStreaming}
      />
    </div>
  )
}
