"use client"

import { useState, useEffect, useRef } from "react"
import { X, Mic, MicOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface VoiceModeOverlayProps {
  isOpen: boolean
  onClose: () => void
  onTranscriptComplete: (text: string) => void
  onSendMessage: (message: string) => Promise<string>
}

type VoiceState = "idle" | "listening" | "processing" | "speaking"

// Voice detection configuration
const VOICE_CONFIG = {
  // Silence detection thresholds
  SILENCE_THRESHOLD: 0.015,        // Audio level below this = silence
  SPEECH_THRESHOLD: 0.025,         // Audio level above this = speech detected

  // Timing (in milliseconds)
  SILENCE_DURATION: 2500,          // Wait 2.5 seconds of silence before stopping
  MIN_RECORDING_TIME: 1000,        // Minimum 1 second of recording before silence detection kicks in
  MAX_RECORDING_TIME: 60000,       // Maximum 60 seconds of recording

  // Speech detection
  SPEECH_DETECTED_DELAY: 500,      // After speech detected, wait this long before starting silence timer
}

export function VoiceModeOverlay({ isOpen, onClose, onTranscriptComplete, onSendMessage }: VoiceModeOverlayProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const [audioLevel, setAudioLevel] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [currentTranscript, setCurrentTranscript] = useState<string>("")
  const [airaResponse, setAiraResponse] = useState<string>("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const bubbleWrapperRef = useRef<HTMLDivElement | null>(null)

  // Enhanced voice detection refs
  const recordingStartTimeRef = useRef<number>(0)
  const speechDetectedRef = useRef<boolean>(false)
  const lastSpeechTimeRef = useRef<number>(0)
  const consecutiveSilenceFramesRef = useRef<number>(0)

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis
      console.log("[Voice Mode] Speech synthesis initialized")
    }
  }, [])

  // Cleanup on close
  useEffect(() => {
    if (!isOpen) {
      console.log("[Voice Mode] Closing, cleanup...")
      stopRecording()
      stopSpeaking()
      setVoiceState("idle")
      setError(null)
      setCurrentTranscript("")
      setAiraResponse("")
    } else {
      console.log("[Voice Mode] Opened")
    }
  }, [isOpen])

  const startRecording = async () => {
    try {
      console.log("[Voice Mode] 🎤 Requesting microphone access...")
      setError(null)

      // Reset speech detection state
      recordingStartTimeRef.current = Date.now()
      speechDetectedRef.current = false
      lastSpeechTimeRef.current = 0
      consecutiveSilenceFramesRef.current = 0

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })
      streamRef.current = stream
      console.log("[Voice Mode] ✅ Microphone access granted")

      // Initialize audio visualization
      await initAudioVisualization(stream)

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4"

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        console.log("[Voice Mode] 🛑 Recording stopped, processing...")
        console.log("[Voice Mode] Total recording time:", Date.now() - recordingStartTimeRef.current, "ms")
        setVoiceState("processing")

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        console.log("[Voice Mode] Audio blob created:", audioBlob.size, "bytes")

        // Only transcribe if we have enough audio data
        if (audioBlob.size > 1000) {
          await transcribeAudio(audioBlob)
        } else {
          setError("Recording was too short. Please try again.")
          setVoiceState("idle")
        }
      }

      mediaRecorder.onerror = (event: any) => {
        console.error("[Voice Mode] MediaRecorder error:", event.error)
        setError("Recording failed. Please try again.")
        setVoiceState("idle")
      }

      // Start recording with timeslice for continuous data collection
      mediaRecorder.start(250) // Collect data every 250ms
      setVoiceState("listening")
      console.log("[Voice Mode] 🔴 Recording started - listening for up to", VOICE_CONFIG.MAX_RECORDING_TIME / 1000, "seconds")

      // Auto-stop after max recording time (60 seconds)
      recordingTimeoutRef.current = setTimeout(() => {
        console.log("[Voice Mode] ⏱️ Max recording time reached, stopping...")
        stopRecording()
      }, VOICE_CONFIG.MAX_RECORDING_TIME)

    } catch (error: any) {
      console.error("[Voice Mode] Error starting recording:", error)

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setError("Aira needs microphone access to use Voice Mode.")
      } else if (error.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone.")
      } else {
        setError("Could not access microphone. Please try again.")
      }

      setVoiceState("idle")
    }
  }

  const stopRecording = () => {
    console.log("[Voice Mode] Stopping recording...")

    // Clear timeouts
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current)
      recordingTimeoutRef.current = null
    }

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }

    // Stop audio visualization
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      console.log("[Voice Mode] 📤 Sending audio to Whisper API...")

      const formData = new FormData()
      formData.append("file", audioBlob, "voice.webm")

      const response = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Transcription failed")
      }

      console.log("[Voice Mode] ✅ Transcription successful:", data.transcript)

      if (data.transcript && data.transcript.trim()) {
        const transcript = data.transcript.trim()
        setCurrentTranscript(transcript)

        // Also send to chat interface for history
        onTranscriptComplete(transcript)

        // Get Aira's response
        await getAiraResponse(transcript)
      } else {
        setError("I couldn't hear that clearly. Could you try again?")
        setVoiceState("idle")
      }
    } catch (error: any) {
      console.error("[Voice Mode] Transcription error:", error)
      setError("I couldn't hear that clearly. Could you try again?")
      setVoiceState("idle")
    }
  }

  const getAiraResponse = async (userMessage: string) => {
    try {
      console.log("[Voice Mode] 💬 Getting Aira's response...")
      setVoiceState("processing")

      // Call the parent's message handler to get Aira's response
      const response = await onSendMessage(userMessage)

      console.log("[Voice Mode] ✅ Got Aira's response:", response.substring(0, 50) + "...")
      setAiraResponse(response)

      // Speak the response
      await speakResponse(response)

      // Return to idle state, ready for next question
      setVoiceState("idle")
      setCurrentTranscript("")
      setAiraResponse("")

    } catch (error: any) {
      console.error("[Voice Mode] Error getting Aira response:", error)
      setError("I'm having trouble connecting. Please try again.")
      setVoiceState("idle")
    }
  }

  const speakResponse = async (text: string): Promise<void> => {
    try {
      console.log("[Voice Mode] 🔊 Generating speech with OpenAI TTS...")
      setVoiceState("speaking")

      // Call our TTS API endpoint
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error("TTS generation failed")
      }

      // Get audio blob
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      console.log("[Voice Mode] ✅ Audio generated, playing...")

      // Play audio
      return new Promise((resolve) => {
        const audio = new Audio(audioUrl)

        audio.onplay = () => {
          console.log("[Voice Mode] ✅ Speech started")
        }

        audio.onended = () => {
          console.log("[Voice Mode] ✅ Speech ended")
          URL.revokeObjectURL(audioUrl)
          resolve()
        }

        audio.onerror = (error) => {
          console.error("[Voice Mode] Audio playback error:", error)
          URL.revokeObjectURL(audioUrl)
          resolve()
        }

        audio.play().catch((error) => {
          console.error("[Voice Mode] Play error:", error)
          URL.revokeObjectURL(audioUrl)
          resolve()
        })
      })
    } catch (error) {
      console.error("[Voice Mode] TTS error:", error)
      // Fallback: just resolve without speaking
      return Promise.resolve()
    }
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
    }
  }

  const initAudioVisualization = async (stream: MediaStream) => {
    try {
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)

      analyser.fftSize = 256
      microphone.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser

      updateAudioLevel()
    } catch (error) {
      console.error("[Voice Mode] Audio visualization error:", error)
    }
  }

  const updateAudioLevel = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)

    // Calculate average audio level with emphasis on speech frequencies (300-3000 Hz)
    // Focus on the lower-mid frequency bins which contain most speech
    const speechBins = dataArray.slice(2, 40) // Approximate speech frequency range
    const average = speechBins.reduce((a, b) => a + b) / speechBins.length
    const normalizedLevel = average / 255
    setAudioLevel(normalizedLevel)

    const now = Date.now()
    const recordingDuration = now - recordingStartTimeRef.current

    // Check if this is speech (above speech threshold)
    if (normalizedLevel >= VOICE_CONFIG.SPEECH_THRESHOLD) {
      // Speech detected!
      if (!speechDetectedRef.current) {
        console.log("[Voice Mode] 🗣️ Speech detected!")
        speechDetectedRef.current = true
      }
      lastSpeechTimeRef.current = now
      consecutiveSilenceFramesRef.current = 0

      // Cancel any pending silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
        silenceTimeoutRef.current = null
      }
    } else if (normalizedLevel < VOICE_CONFIG.SILENCE_THRESHOLD) {
      // Silence detected
      consecutiveSilenceFramesRef.current++

      // Only start silence timer if:
      // 1. We've been recording for at least MIN_RECORDING_TIME
      // 2. Speech has been detected at some point
      // 3. There's been some time since last speech
      const timeSinceLastSpeech = lastSpeechTimeRef.current > 0 ? now - lastSpeechTimeRef.current : 0
      const shouldCheckSilence =
        recordingDuration > VOICE_CONFIG.MIN_RECORDING_TIME &&
        speechDetectedRef.current &&
        timeSinceLastSpeech > VOICE_CONFIG.SPEECH_DETECTED_DELAY

      if (shouldCheckSilence && !silenceTimeoutRef.current) {
        console.log("[Voice Mode] 🤫 Silence detected after speech, will auto-stop in", VOICE_CONFIG.SILENCE_DURATION / 1000, "seconds...")
        silenceTimeoutRef.current = setTimeout(() => {
          console.log("[Voice Mode] ⏱️ Auto-stopping due to extended silence after speech")
          console.log("[Voice Mode] Recording duration:", recordingDuration, "ms, time since last speech:", timeSinceLastSpeech, "ms")
          stopRecording()
        }, VOICE_CONFIG.SILENCE_DURATION)
      }
    } else {
      // Audio level is between silence and speech thresholds (ambient noise)
      // This might be a pause between words, don't treat as complete silence
      // But do reset consecutive silence counter
      consecutiveSilenceFramesRef.current = 0
    }

    animationFrameRef.current = requestAnimationFrame(updateAudioLevel)
  }

  const handleMicClick = () => {
    console.log("[Voice Mode] Mic clicked, current state:", voiceState)

    if (voiceState === "idle") {
      startRecording()
    } else if (voiceState === "listening") {
      stopRecording()
    }
  }

  // Auto-scroll to bottom when Aira responds
  useEffect(() => {
    if (airaResponse && bubbleWrapperRef.current) {
      bubbleWrapperRef.current.scrollTo({
        top: bubbleWrapperRef.current.scrollHeight,
        behavior: "smooth",
      })
    }
  }, [airaResponse])

  // Clean paragraphs - remove excessive line breaks
  const cleanParagraphs = (text: string) => {
    return text
      .replace(/\n{3,}/g, "\n\n") // Max 2 line breaks
      .trim()
  }

  const getStateText = () => {
    if (error) return error

    switch (voiceState) {
      case "idle":
        return "Tap to speak"
      case "listening":
        // Show different message based on whether speech has been detected
        if (speechDetectedRef.current) {
          return "Listening… (tap to finish)"
        }
        return "I'm listening…"
      case "processing":
        return "Thinking…"
      case "speaking":
        return "Aira is speaking…"
      default:
        return "Tap to speak"
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-br from-[#0a0a1f] via-[#1a0a2e] to-[#0f0520] overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/60 backdrop-blur-[2px] pointer-events-none" />

      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-6 right-6 z-20 text-white/70 hover:text-white hover:bg-white/10 rounded-full w-12 h-12"
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col h-full pt-20 pb-28 px-5">
        {/* Floating Aira Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-full blur-xl opacity-40 animate-pulse" />
            <div className="relative w-20 h-20 animate-float">
              <Image
                src="/airalogo2.png"
                alt="Aira"
                width={80}
                height={80}
                className="w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* State Text */}
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-medium font-heading ${error ? "text-red-400" : "text-white/90"}`}>
            {getStateText()}
          </h2>
        </div>
        {/* Scrollable Bubble Wrapper */}
        <div
          ref={bubbleWrapperRef}
          className="flex-1 w-full max-w-[480px] mx-auto overflow-y-auto overflow-x-hidden px-1 space-y-5 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* User's Transcript Bubble */}
          {currentTranscript && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="bg-white/6 backdrop-blur-md rounded-[22px] px-[22px] py-[18px] border border-white/10 shadow-lg">
                <p className="text-white/50 text-[0.85rem] uppercase tracking-wider mb-2">You said</p>
                <p className="text-white/85 text-[1.05rem] leading-[1.45] whitespace-normal">
                  "{currentTranscript}"
                </p>
              </div>
            </div>
          )}

          {/* Aira's Response Bubble - Therapeutic Glass Card */}
          {airaResponse && voiceState === "speaking" && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Soft glow container */}
              <div className="relative">
                {/* Soft green glow behind card */}
                <div className="absolute -inset-2 bg-gradient-to-br from-primary/25 via-accent/15 to-secondary/25 rounded-[26px] blur-2xl opacity-50" />

                {/* Glass effect card */}
                <div className="relative bg-white/8 backdrop-blur-xl rounded-[22px] px-[22px] py-[18px] border border-white/10 shadow-2xl">
                  <p className="text-white/50 text-[0.85rem] uppercase tracking-wider mb-3">Aira</p>
                  <div className="space-y-4">
                    {cleanParagraphs(airaResponse)
                      .split("\n\n")
                      .map((paragraph, i) => (
                        <p
                          key={i}
                          className="text-white/90 text-[1.05rem] leading-[1.65] whitespace-normal animate-in fade-in slide-in-from-bottom-1"
                          style={{
                            animationDelay: `${i * 300}ms`,
                            animationDuration: "500ms",
                          }}
                        >
                          {paragraph}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Waveform Animation - Centered when listening */}
          {voiceState === "listening" && !currentTranscript && (
            <div className="flex items-center justify-center h-24">
              <div className="flex items-center justify-center gap-1">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-primary to-accent rounded-full transition-all duration-150"
                    style={{
                      height: `${Math.max(8, audioLevel * 64 * (1 + Math.sin((Date.now() / 200) + i)))}px`,
                      opacity: 0.6 + audioLevel * 0.4,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Processing Animation */}
          {voiceState === "processing" && (
            <div className="flex items-center justify-center h-24">
              <div className="flex items-center justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 bg-accent rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mic Button - Fixed at bottom with safe zone */}
      <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-[999]">
        <button
          onClick={handleMicClick}
          disabled={voiceState === "processing" || voiceState === "speaking"}
          className="relative group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {/* Meditation breath rings - soft pulsing */}
          {voiceState === "idle" && (
            <>
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-[ping_3s_ease-in-out_infinite]" />
              <div className="absolute inset-0 bg-accent/15 rounded-full animate-[ping_3s_ease-in-out_infinite] delay-1000" />
            </>
          )}

          {/* Active listening rings */}
          {voiceState === "listening" && (
            <>
              <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping delay-300" />
            </>
          )}

          {/* Button with soft glow */}
          <div className="relative">
            {/* Soft glow behind button */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full blur-xl opacity-60" />

            {/* Main button */}
            <div className={`
              relative w-[70px] h-[70px] rounded-full
              bg-gradient-to-br from-primary to-accent
              flex items-center justify-center
              shadow-2xl shadow-primary/50
              transition-all duration-500 ease-in-out
              ${voiceState === "idle" ? "animate-[pulse_3s_ease-in-out_infinite]" : ""}
              ${voiceState === "listening" ? "scale-110" : ""}
              group-hover:scale-105
              group-active:scale-95
            `}>
              {voiceState === "listening" ? (
                <MicOff className="w-8 h-8 text-white drop-shadow-lg" />
              ) : (
                <Mic className="w-8 h-8 text-white drop-shadow-lg" />
              )}
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
