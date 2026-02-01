"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Sparkles, Menu, Save, Trash2, History, LifeBuoy, MoreVertical, Mic } from "lucide-react"
import { ChatMessage } from "./chat-message"
import { ChatSidebar, type ChatSidebarHandle } from "./chat-sidebar"
import { UsageIndicator } from "./usage-indicator"
import { VoiceModeOverlay } from "@/components/voice-mode-overlay"
import Link from "next/link"
import Image from "next/image"
import { saveChat, loadChat } from "@/lib/chat-utils"
import { trackChatStarted, trackMessageSent, trackVoiceModeStarted, trackVoiceModeEnded, trackError } from "@/lib/vercel-analytics"

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
  const [usageRefreshTrigger, setUsageRefreshTrigger] = useState(0) // Add trigger for usage refresh
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [voiceModeOpen, setVoiceModeOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<ChatSidebarHandle>(null)
  const { user, logout } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen) {
        const target = event.target as HTMLElement
        if (!target.closest('.mobile-menu-container')) {
          setMobileMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen])

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

    const messageContent = input.trim()

    // Track message sent with length
    trackMessageSent(messageContent.length)

    // Track chat started if this is the first user message
    if (messages.length === 1) {
      trackChatStarted()
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const emotion = detectEmotion(input)
    setCurrentEmotion(emotion)

    try {
      console.log("[Chat Interface] Sending message for user:", user?.id)
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userId: user?.id,
        }),
      })

      const data = await response.json()

      // Check if user hit daily limit
      if (response.status === 429) {
        console.log("[Chat Interface] User hit daily limit")
        const limitMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message || "You've reached your daily chat limit. Upgrade to Premium for unlimited chats!",
          emotion: "empathetic",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, limitMessage])
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        emotion,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Trigger usage refresh after successful message
      console.log("[Chat Interface] Message sent successfully, triggering usage refresh")
      setUsageRefreshTrigger(prev => {
        const newValue = prev + 1
        console.log("[Chat Interface] Usage refresh trigger:", prev, "->", newValue)
        return newValue
      })
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage = error instanceof Error ? error.message : "Chat error"
      trackError('chat', errorMessage)
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        emotion: "empathetic",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMsg])
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

  const handleVoiceTranscript = (transcript: string) => {
    console.log("[Chat Interface] ✅ Voice transcript received:", transcript)

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: transcript.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
  }

  const handleVoiceSendMessage = async (message: string): Promise<string> => {
    console.log("[Chat Interface] 💬 Voice Mode requesting Aira response...")

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    }

    const emotion = detectEmotion(message)
    setCurrentEmotion(emotion)

    try {
      console.log("[Chat Interface] Sending to API with voice mode flag...")
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userId: user?.id,
          isVoiceMode: true, // Flag for voice-optimized responses
        }),
      })

      const data = await response.json()

      if (response.status === 429) {
        const limitMessage = data.message || "You've reached your daily chat limit. Upgrade to Premium for unlimited chats!"
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: limitMessage,
          emotion: "empathetic",
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        return limitMessage
      }

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        emotion,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setUsageRefreshTrigger(prev => prev + 1)
      console.log("[Chat Interface] ✅ Aira responded successfully")

      return data.message
    } catch (error) {
      console.error("[Chat Interface] Voice message error:", error)
      const errorMsg = "I'm having trouble connecting right now. Please try again in a moment."
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: errorMsg,
        emotion: "empathetic",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      return errorMsg
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
      <header className="w-full flex flex-col bg-background border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm">
        {/* Row 1: Main Navigation */}
        <div className="flex items-center justify-between px-4 py-3 min-h-[60px]">
          {/* Left: Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title="Recent chats"
            className="h-10 w-10 flex-shrink-0"
          >
            <Menu className="w-6 h-6" />
          </Button>

          {/* Center: Aira Logo + Name */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/airalogo2.png"
              alt="Aira Logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
            <h1 className="font-semibold text-lg">Aira</h1>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Desktop Actions */}
            <Link href="/support" className="hidden md:inline-block">
              <Button
                variant="ghost"
                size="icon"
                title="Support Resources"
                className="h-10 w-10"
              >
                <LifeBuoy className="w-5 h-5" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveChat}
              disabled={isSaving || messages.length <= 1}
              title="Save this conversation"
              className="h-10 w-10 hidden md:inline-flex"
            >
              <Save className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearChat}
              title="Clear chat"
              className="h-10 w-10 hidden md:inline-flex text-destructive hover:text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </Button>

            {/* Mobile Menu Toggle */}
            <div className="relative md:hidden mobile-menu-container">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-10 w-10"
              >
                <MoreVertical className="w-5 h-5" />
              </Button>

              {/* Mobile Dropdown */}
              {mobileMenuOpen && (
                <div className="absolute right-0 top-12 bg-background border border-border rounded-lg shadow-lg py-2 min-w-[180px] z-20">
                  <Link href="/support" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2">
                      <LifeBuoy className="w-4 h-4" />
                      <span className="text-sm">Support</span>
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      handleSaveChat()
                      setMobileMenuOpen(false)
                    }}
                    disabled={isSaving || messages.length <= 1}
                    className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span className="text-sm">Save Chat</span>
                  </button>
                  <button
                    onClick={() => {
                      handleClearChat()
                      setMobileMenuOpen(false)
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-muted flex items-center gap-2 text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Clear Chat</span>
                  </button>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="h-10 px-3"
            >
              <span className="text-sm">Logout</span>
            </Button>
          </div>
        </div>

        {/* Row 2: Tagline */}
        <div className="text-center pb-2">
          <p className="text-xs text-muted-foreground/70 truncate px-4">
            {currentChatTitle || "Always here for you"}
          </p>
        </div>

        {/* Row 3: Usage Indicator */}
        <div className="px-4 pb-2">
          <UsageIndicator refreshTrigger={usageRefreshTrigger} />
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

            {/* Voice Mode Button */}
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="h-[60px] w-[60px] bg-gradient-to-br from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 border-primary/30"
              onClick={() => {
                trackVoiceModeStarted()
                setVoiceModeOpen(true)
              }}
            >
              <Mic className="w-5 h-5 text-primary" />
            </Button>

            {/* Send Button */}
            <Button
              type="submit"
              size="icon"
              className="h-[60px] w-[60px]"
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-5 h-5" />
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Voice Mode Overlay */}
      <VoiceModeOverlay
        isOpen={voiceModeOpen}
        onClose={() => setVoiceModeOpen(false)}
        onTranscriptComplete={handleVoiceTranscript}
        onSendMessage={handleVoiceSendMessage}
      />
    </div>
  )
}
