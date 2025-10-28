"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles, Menu, Save, Trash2, History, LifeBuoy } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { EmotionRing } from "./emotion-ring"
import { ChatSidebar, type ChatSidebarHandle } from "./chat-sidebar"
import Link from "next/link"
import { saveChat, loadChat } from "@/lib/chat-utils"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  emotion?: "calm" | "empathetic" | "supportive" | "reflective"
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm Aira, your AI companion. I'm here to listen, understand, and support you. How are you feeling today?",
      emotion: "empathetic",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<"calm" | "empathetic" | "supportive" | "reflective">("calm")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentChatTitle, setCurrentChatTitle] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<ChatSidebarHandle>(null)
  const { user, logout } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const detectEmotion = (text: string): "calm" | "empathetic" | "supportive" | "reflective" => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes("sad") || lowerText.includes("anxious") || lowerText.includes("worried")) {
      return "empathetic"
    }
    if (lowerText.includes("help") || lowerText.includes("support") || lowerText.includes("need")) {
      return "supportive"
    }
    if (lowerText.includes("think") || lowerText.includes("wonder") || lowerText.includes("reflect")) {
      return "reflective"
    }
    return "calm"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const emotion = detectEmotion(input)
    setCurrentEmotion(emotion)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        emotion,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        emotion: "empathetic",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveChat = async () => {
    if (messages.length <= 1) {
      alert("Please have a conversation before saving.")
      return
    }

    setIsSaving(true)
    try {
      const result = await saveChat(messages, undefined, user?.id)
      console.log("[Chat Interface] Chat saved successfully:", result)
      alert(`✅ Chat saved! ID: ${result.id}\nTitle: ${result.title}\nMessages: ${result.messageCount}`)

      // Refresh the sidebar to show the new chat
      console.log("[Chat Interface] Refreshing sidebar...")
      await sidebarRef.current?.refresh()

      // Open the sidebar so user can see the new chat
      setSidebarOpen(true)
    } catch (error) {
      console.error("[Chat Interface] Error saving chat:", error)
      alert(`❌ Failed to save chat: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear this chat? This cannot be undone.")) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Hello! I'm Aira, your AI companion. I'm here to listen, understand, and support you. How are you feeling today?",
          emotion: "empathetic",
          timestamp: new Date(),
        },
      ])
      setCurrentChatTitle(null)
    }
  }

  const handleSelectChat = async (chatId: string, title: string) => {
    // Prevent multiple clicks while loading
    if (isLoadingChat) {
      console.log("[Chat Interface] Already loading a chat, ignoring click")
      return
    }

    setIsLoadingChat(true)
    console.log("[Chat Interface] Loading chat:", chatId, title)

    try {
      const chatData = await loadChat(chatId, user?.id)
      console.log("[Chat Interface] Chat loaded successfully:", chatId, "with", chatData.messages.length, "messages")

      // Convert timestamp strings back to Date objects
      const loadedMessages: Message[] = chatData.messages.map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))

      setMessages(loadedMessages)
      setCurrentChatTitle(title)
      setSidebarOpen(false)
    } catch (error) {
      console.error("[Chat Interface] Error loading chat:", error)
      alert(`Failed to load chat: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoadingChat(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      {/* Sidebar */}
      <ChatSidebar
        ref={sidebarRef}
        userId={user?.id}
        onSelectChat={handleSelectChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Recent chats"
            >
              <History className="w-5 h-5" />
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">Aira</h1>
                <p className="text-xs text-muted-foreground">{currentChatTitle || "Always here for you"}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/support">
              <Button
                variant="ghost"
                size="sm"
                title="Support Resources"
                className="text-primary hover:text-primary"
              >
                <LifeBuoy className="w-4 h-4" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveChat}
              disabled={isSaving || messages.length <= 1}
              title="Save this conversation"
            >
              <Save className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Save</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              title="Clear chat"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="glass-card px-4 py-3 max-w-[80%]">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="w-2 h-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Emotion Ring */}
      <EmotionRing emotion={currentEmotion} />

      {/* Input Area */}
      <div className="border-t border-border/50 backdrop-blur-sm bg-background/80 sticky bottom-0">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Share what's on your mind..."
              className="min-h-[60px] max-h-[200px] resize-none bg-background/50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button type="submit" size="icon" className="h-[60px] w-[60px]" disabled={isLoading || !input.trim()}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}
