import { Sparkles, User } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  emotion?: "calm" | "empathetic" | "supportive" | "reflective"
  timestamp: Date
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user"

  const emotionColors = {
    calm: "from-primary/20 to-primary/10",
    empathetic: "from-accent/20 to-accent/10",
    supportive: "from-primary/30 to-accent/20",
    reflective: "from-accent/30 to-primary/20",
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-3 max-w-[80%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser
              ? "bg-muted"
              : `bg-gradient-to-br ${message.emotion ? emotionColors[message.emotion] : emotionColors.calm}`
          }`}
        >
          {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-primary" />}
        </div>

        {/* Message Content */}
        <div className={`glass-card px-4 py-3 ${isUser ? "bg-primary/10" : ""}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  )
}
