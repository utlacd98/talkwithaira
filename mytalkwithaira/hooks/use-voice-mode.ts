"use client"

import { useState, useRef, useCallback, useEffect } from "react"

interface UseVoiceModeOptions {
  onTranscript?: (text: string) => void
  onError?: (error: string) => void
  autoSpeak?: boolean
}

export function useVoiceMode({ onTranscript, onError, autoSpeak = false }: UseVoiceModeOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [isSupported, setIsSupported] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech recognition and synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check for Speech Recognition support
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const speechSynthesis = window.speechSynthesis

      setIsSupported(!!(SpeechRecognition && speechSynthesis))

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex
          const transcriptText = event.results[current][0].transcript
          setTranscript(transcriptText)

          // If final result, call the callback
          if (event.results[current].isFinal) {
            onTranscript?.(transcriptText)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("[Voice Mode] Recognition error:", event.error)
          setIsListening(false)
          onError?.(`Speech recognition error: ${event.error}`)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }

      if (speechSynthesis) {
        synthRef.current = speechSynthesis
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [onTranscript, onError])

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      onError?.("Speech recognition not supported in this browser")
      return
    }

    try {
      // Stop any ongoing speech
      if (synthRef.current) {
        synthRef.current.cancel()
        setIsSpeaking(false)
      }

      setTranscript("")
      recognitionRef.current.start()
      setIsListening(true)
    } catch (error) {
      console.error("[Voice Mode] Error starting recognition:", error)
      onError?.("Failed to start listening")
    }
  }, [onError])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }, [])

  // Speak text
  const speak = useCallback((text: string, options?: { rate?: number; pitch?: number; volume?: number }) => {
    if (typeof window === "undefined") {
      console.error("[Voice Mode] Window not available (SSR)")
      return
    }

    if (!window.speechSynthesis) {
      console.error("[Voice Mode] Speech synthesis not supported")
      onError?.("Speech synthesis not supported in this browser")
      return
    }

    console.log("[Voice Mode] ========================================")
    console.log("[Voice Mode] Speak called with text:", text.substring(0, 100) + "...")
    console.log("[Voice Mode] Voice enabled:", voiceEnabled)
    console.log("[Voice Mode] Speech synthesis available:", !!window.speechSynthesis)

    // Cancel any ongoing speech first
    try {
      window.speechSynthesis.cancel()
      console.log("[Voice Mode] Cancelled any ongoing speech")
    } catch (e) {
      console.error("[Voice Mode] Error cancelling speech:", e)
    }

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text)

    // Configure voice settings
    utterance.rate = options?.rate || 1.0
    utterance.pitch = options?.pitch || 1.0
    utterance.volume = options?.volume || 1.0
    utterance.lang = "en-US"

    console.log("[Voice Mode] Utterance created with settings:", {
      rate: utterance.rate,
      pitch: utterance.pitch,
      volume: utterance.volume,
      lang: utterance.lang
    })

    // Event handlers
    utterance.onstart = () => {
      console.log("[Voice Mode] ✅ Speech STARTED")
      setIsSpeaking(true)
    }

    utterance.onend = () => {
      console.log("[Voice Mode] ✅ Speech ENDED")
      setIsSpeaking(false)
      currentUtteranceRef.current = null
    }

    utterance.onerror = (event) => {
      console.error("[Voice Mode] ❌ Speech ERROR:", event.error, event)
      setIsSpeaking(false)
      currentUtteranceRef.current = null
      onError?.(`Speech error: ${event.error}`)
    }

    utterance.onpause = () => {
      console.log("[Voice Mode] Speech PAUSED")
    }

    utterance.onresume = () => {
      console.log("[Voice Mode] Speech RESUMED")
    }

    // Try to load and set voice
    const loadVoiceAndSpeak = () => {
      try {
        const voices = window.speechSynthesis.getVoices()
        console.log("[Voice Mode] Total voices available:", voices.length)

        if (voices.length > 0) {
          // Log all available voices
          voices.forEach((voice, i) => {
            console.log(`[Voice Mode] Voice ${i}: ${voice.name} (${voice.lang}) ${voice.default ? "⭐" : ""}`)
          })

          // Try to find a good English voice
          const englishVoices = voices.filter(v => v.lang.startsWith("en"))
          console.log("[Voice Mode] English voices:", englishVoices.length)

          if (englishVoices.length > 0) {
            // Prefer the first English voice
            utterance.voice = englishVoices[0]
            console.log("[Voice Mode] Selected voice:", utterance.voice.name)
          }
        } else {
          console.log("[Voice Mode] No voices available, using default")
        }

        // Store reference
        currentUtteranceRef.current = utterance

        // Speak!
        console.log("[Voice Mode] Calling speechSynthesis.speak()...")
        window.speechSynthesis.speak(utterance)

        // Check status after a moment
        setTimeout(() => {
          console.log("[Voice Mode] Status check - speaking:", window.speechSynthesis.speaking, "pending:", window.speechSynthesis.pending, "paused:", window.speechSynthesis.paused)
        }, 100)

        console.log("[Voice Mode] ========================================")
      } catch (error) {
        console.error("[Voice Mode] Error in loadVoiceAndSpeak:", error)
        onError?.(`Failed to speak: ${error}`)
      }
    }

    // Check if voices are already loaded
    const voices = window.speechSynthesis.getVoices()

    if (voices.length === 0) {
      console.log("[Voice Mode] Voices not loaded yet, waiting...")

      // Wait for voices to load
      window.speechSynthesis.onvoiceschanged = () => {
        console.log("[Voice Mode] Voices changed event fired")
        loadVoiceAndSpeak()
      }

      // Also try after a short delay as fallback
      setTimeout(() => {
        const voicesNow = window.speechSynthesis.getVoices()
        if (voicesNow.length > 0) {
          console.log("[Voice Mode] Voices loaded via timeout")
          loadVoiceAndSpeak()
        }
      }, 100)
    } else {
      console.log("[Voice Mode] Voices already loaded")
      loadVoiceAndSpeak()
    }
  }, [onError, voiceEnabled])

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
      currentUtteranceRef.current = null
    }
  }, [])

  // Toggle voice mode
  const toggleVoiceMode = useCallback(() => {
    setVoiceEnabled((prev) => !prev)
  }, [])

  return {
    isListening,
    isSpeaking,
    transcript,
    isSupported,
    voiceEnabled,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleVoiceMode,
  }
}

