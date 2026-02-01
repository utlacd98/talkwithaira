"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Volume2, Mic } from "lucide-react"

export default function VoiceTestPage() {
  const [testResult, setTestResult] = useState<string>("")
  const [isSupported, setIsSupported] = useState<boolean | null>(null)

  const testSpeechSynthesis = () => {
    setTestResult("Testing speech synthesis...")
    
    if (!window.speechSynthesis) {
      setTestResult("❌ Speech Synthesis NOT supported in this browser")
      setIsSupported(false)
      return
    }

    setIsSupported(true)
    const utterance = new SpeechSynthesisUtterance("Hello! I'm Aira. This is a test of the text-to-speech system.")
    
    utterance.onstart = () => {
      setTestResult("✅ Speech started successfully!")
    }
    
    utterance.onend = () => {
      setTestResult((prev) => prev + "\n✅ Speech completed!")
    }
    
    utterance.onerror = (event) => {
      setTestResult((prev) => prev + `\n❌ Error: ${event.error}`)
    }

    // List available voices
    const voices = window.speechSynthesis.getVoices()
    console.log("Available voices:", voices)
    setTestResult((prev) => prev + `\n\nFound ${voices.length} voices`)

    window.speechSynthesis.speak(utterance)
  }

  const testSpeechRecognition = () => {
    setTestResult("Testing speech recognition...")
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      setTestResult("❌ Speech Recognition NOT supported in this browser")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setTestResult("✅ Listening... Speak now!")
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setTestResult((prev) => prev + `\n\nYou said: "${transcript}"`)
    }

    recognition.onerror = (event: any) => {
      setTestResult((prev) => prev + `\n❌ Error: ${event.error}`)
    }

    recognition.onend = () => {
      setTestResult((prev) => prev + "\n✅ Recognition ended")
    }

    recognition.start()
  }

  const listVoices = () => {
    if (!window.speechSynthesis) {
      setTestResult("❌ Speech Synthesis not supported")
      return
    }

    const voices = window.speechSynthesis.getVoices()
    
    if (voices.length === 0) {
      setTestResult("⏳ Loading voices... Click again in a moment.")
      // Trigger voice loading
      window.speechSynthesis.onvoiceschanged = () => {
        const newVoices = window.speechSynthesis.getVoices()
        let result = `✅ Found ${newVoices.length} voices:\n\n`
        newVoices.forEach((voice, i) => {
          result += `${i + 1}. ${voice.name} (${voice.lang}) ${voice.default ? "⭐ DEFAULT" : ""}\n`
        })
        setTestResult(result)
      }
      return
    }

    let result = `✅ Found ${voices.length} voices:\n\n`
    voices.forEach((voice, i) => {
      result += `${i + 1}. ${voice.name} (${voice.lang}) ${voice.default ? "⭐ DEFAULT" : ""}\n`
    })
    setTestResult(result)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Voice Mode Test Page</h1>
        
        <div className="glass-card p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Browser Support Check</h2>
          
          <div className="space-y-3">
            <Button onClick={testSpeechSynthesis} className="w-full gap-2">
              <Volume2 className="w-4 h-4" />
              Test Text-to-Speech (TTS)
            </Button>
            
            <Button onClick={testSpeechRecognition} className="w-full gap-2">
              <Mic className="w-4 h-4" />
              Test Speech-to-Text (STT)
            </Button>
            
            <Button onClick={listVoices} variant="outline" className="w-full">
              List Available Voices
            </Button>
          </div>
        </div>

        {testResult && (
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded">
              {testResult}
            </pre>
          </div>
        )}

        <div className="mt-6 text-sm text-muted-foreground">
          <p><strong>Browser Compatibility:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Chrome/Edge: Full support ✅</li>
            <li>Safari: Full support ✅</li>
            <li>Firefox: Limited support ⚠️</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

