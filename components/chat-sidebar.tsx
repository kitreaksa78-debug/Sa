'use client'

import { Plus, MessageSquare, Trash2, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ConversationMeta = {
  id: string
  title: string
}

export function ChatSidebar({
  conversations,
  activeId,
  open,
  onSelect,
  onNew,
  onDelete,
  onClose,
}: {
  conversations: ConversationMeta[]
  activeId: string
  open: boolean
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 md:static md:z-auto md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2 px-1">
            <div className="flex size-7 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <span className="text-sm font-semibold">ChatGPT</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-sidebar-accent md:hidden"
            aria-label="Close sidebar"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={onNew}
            className="flex w-full items-center gap-2 rounded-xl border border-sidebar-border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent"
          >
            <Plus className="size-4" />
            New chat
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-2">
          <p className="px-2 pb-1 text-xs font-medium text-muted-foreground">
            Chats
          </p>
          <ul className="flex flex-col gap-0.5">
            {conversations.map((c) => (
              <li key={c.id}>
                <div
                  className={cn(
                    'group flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors',
                    c.id === activeId
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/60',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{c.title}</span>
                  </button>
                  {conversations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDelete(c.id)}
                      className="shrink-0 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                      aria-label={`Delete ${c.title}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border px-3 py-3">
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm">
            <div className="flex size-7 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
              U
            </div>
            <span className="text-muted-foreground">You</span>
          </div>
        </div>
      </aside>
    </>
  )
}
