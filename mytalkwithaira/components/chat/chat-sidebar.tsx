"use client"

import { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, Trash2, MessageSquare } from "lucide-react"
import { getSavedChats, deleteChat, type SavedChat } from "@/lib/chat-utils"

interface ChatSidebarProps {
  userId?: string
  onSelectChat: (chatId: string, title: string) => void
  isOpen: boolean
  onToggle: () => void
}

export interface ChatSidebarHandle {
  refresh: () => void
}

export const ChatSidebar = forwardRef<ChatSidebarHandle, ChatSidebarProps>(
  function ChatSidebar({ userId, onSelectChat, isOpen, onToggle }, ref) {
    const [chats, setChats] = useState<SavedChat[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hoveredChatId, setHoveredChatId] = useState<string | null>(null)

    const loadChats = useCallback(async () => {
      const finalUserId = userId || "anonymous"

      console.log("[Chat Sidebar] Loading chats for user:", finalUserId)
      setIsLoading(true)
      setError(null)
      try {
        const savedChats = await getSavedChats(finalUserId)
        console.log("[Chat Sidebar] Loaded", savedChats.length, "chats:", savedChats.map(c => c.title))
        setChats(savedChats)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to load chats"
        setError(errorMsg)
        console.error("[Chat Sidebar] Error loading chats:", err)
      } finally {
        setIsLoading(false)
      }
    }, [userId])

    useEffect(() => {
      loadChats()
    }, [loadChats])

    useImperativeHandle(ref, () => ({
      refresh: loadChats,
    }), [loadChats])

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation()

    if (!confirm("Are you sure you want to delete this chat?")) {
      return
    }

    try {
      await deleteChat(chatId)
      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
    } catch (err) {
      alert(`Failed to delete chat: ${err instanceof Error ? err.message : "Unknown error"}`)
    }
  }

  const handleRefresh = () => {
    loadChats()
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-background border-r border-border/50 backdrop-blur-sm transition-transform duration-300 z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-border/50 p-4 flex items-center justify-between">
            <h2 className="font-semibold text-lg">Recent Chats</h2>
            <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="p-4">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2 w-full">
                  Retry
                </Button>
              </div>
            ) : chats.length === 0 ? (
              <div className="p-4 text-center">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">No saved chats yet</p>
                <p className="text-xs text-muted-foreground mt-1">Save a conversation to see it here</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    onMouseEnter={() => setHoveredChatId(chat.id)}
                    onMouseLeave={() => setHoveredChatId(null)}
                    className="group flex items-start justify-between gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                  >
                    <button
                      onClick={() => onSelectChat(chat.id, chat.title)}
                      className="flex-1 text-left text-sm"
                    >
                      <p className="font-medium truncate">{chat.title}</p>
                      <p className="text-xs text-muted-foreground">{chat.messageCount} messages</p>
                      {chat.tags && chat.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {chat.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                          {chat.tags.length > 2 && (
                            <span className="inline-block px-2 py-0.5 text-xs text-muted-foreground">
                              +{chat.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                    {hoveredChatId === chat.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteChat(e, chat.id)}
                        className="h-6 w-6 text-destructive hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {chats.length > 0 && (
            <div className="border-t border-border/50 p-4">
              <Button variant="outline" size="sm" onClick={handleRefresh} className="w-full">
                Refresh
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Button */}
      {!isOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="fixed left-0 top-20 z-30 rounded-r-md"
          title="Open recent chats"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={onToggle} />
      )}
    </>
    )
  }
)

