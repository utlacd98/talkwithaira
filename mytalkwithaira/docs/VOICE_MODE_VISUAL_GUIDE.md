# 🎙️ Voice Mode - Visual Guide

## 📱 User Interface Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                    [X]  │ ← Close Button
│                                                         │
│                    ╭─────────────╮                      │
│                    │   ✨ 🌟 ✨   │                      │
│                    │             │                      │
│                    │  AIRA LOGO  │ ← Floating Logo      │
│                    │             │   (Glowing, Pulsing) │
│                    │   ✨ 🌟 ✨   │                      │
│                    ╰─────────────╯                      │
│                                                         │
│                                                         │
│              "Tap to speak"                             │ ← State Text
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                      ╭───────╮                          │
│                      │  🎤   │ ← Mic Button             │
│                      │       │   (Glowing, Pulsing)     │
│                      ╰───────╯                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Visual States

### **1. IDLE STATE**
```
┌─────────────────────────────────────────────────────────┐
│ Background: Dark gradient (#0a0a1f → #1a0a2e → #0f0520)│
│ Particles: Soft glowing orbs floating                   │
│                                                         │
│                    ╭─────────────╮                      │
│                    │   ✨ AIRA   │ ← Floating up/down   │
│                    ╰─────────────╯   (3s animation)     │
│                                                         │
│                  "Tap to speak"                         │
│                                                         │
│                                                         │
│                      ╭───────╮                          │
│                      │  🎤   │ ← Soft pulse             │
│                      ╰───────╯                          │
└─────────────────────────────────────────────────────────┘
```

### **2. LISTENING STATE**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ╭─────────────╮                      │
│                    │   ✨ AIRA   │                      │
│                    ╰─────────────╯                      │
│                                                         │
│                   "Listening…"                          │
│          "Tell me about your day"                       │ ← Live transcript
│                                                         │
│              ▂▃▅▇█▇▅▃▂▁▂▃▅▇█▇▅▃▂                        │ ← Waveform
│              ▁▂▃▅▇█▇▅▃▂▁▂▃▅▇█▇▅▃                        │   (Audio-reactive)
│                                                         │
│                                                         │
│                  ╭─────────────╮                        │
│                 ╱   ╭───────╮   ╲ ← Animated rings      │
│                │    │  🎤   │    │  (Ping effect)       │
│                 ╲   ╰───────╯   ╱                       │
│                  ╰─────────────╯                        │
└─────────────────────────────────────────────────────────┘
```

### **3. PROCESSING STATE**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ╭─────────────╮                      │
│                    │   ✨ AIRA   │                      │
│                    ╰─────────────╯                      │
│                                                         │
│                  "Processing…"                          │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
│                      ╭───────╮                          │
│                      │  🎤   │ ← Disabled (50% opacity)│
│                      ╰───────╯                          │
└─────────────────────────────────────────────────────────┘
```

### **4. SPEAKING STATE**
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    ╭─────────────╮                      │
│                    │   ✨ AIRA   │                      │
│                    ╰─────────────╯                      │
│                                                         │
│              "Aira is responding…"                      │
│                                                         │
│                    ● ● ●                                │ ← Pulsing dots
│                                                         │   (Staggered)
│                                                         │
│                      ╭───────╮                          │
│                      │  🎤   │ ← Disabled               │
│                      ╰───────╯                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

### **Background Gradient**
```
Top:    #0a0a1f (Deep Navy)
Middle: #1a0a2e (Dark Purple)
Bottom: #0f0520 (Deep Violet)
```

### **Particle Effects**
```
Particle 1: Primary/20 (Apple Green) - Top Left
Particle 2: Accent/20 (Teal) - Bottom Right
Particle 3: Secondary/10 (Lilac) - Center
```

### **Logo Glow**
```
Inner: Gradient (Primary → Accent → Secondary)
Outer: Blur 2xl with 50% opacity
```

### **Mic Button**
```
Background: Gradient (Primary → Accent)
Shadow: Primary/50 with 2xl blur
Hover: Scale 1.05
Active: Scale 0.95
```

### **Waveform Bars**
```
Color: Gradient (Primary → Accent)
Opacity: 0.6 + (audioLevel * 0.4)
Height: 8px to 64px (audio-reactive)
```

---

## 📐 Dimensions

### **Logo**
- Mobile: 128px × 128px (w-32 h-32)
- Desktop: 160px × 160px (w-40 h-40)
- Glow radius: 80px blur

### **Mic Button**
- Mobile: 80px × 80px (w-20 h-20)
- Desktop: 96px × 96px (w-24 h-24)
- Icon size: 40px (mobile), 48px (desktop)

### **Close Button**
- Size: 48px × 48px (w-12 h-12)
- Icon: 24px (w-6 h-6)
- Position: 24px from top-right

### **Waveform**
- Bars: 20 total
- Width: 4px each
- Gap: 4px
- Height: 8px to 64px (dynamic)

### **Text**
- Heading: 3xl (mobile), 4xl (desktop)
- Transcript: lg (18px)
- Font: Heading font (bold)

---

## 🎬 Animations

### **Float Animation**
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
Duration: 3s
Easing: ease-in-out
Loop: infinite
```

### **Pulse Animation**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
Duration: 2s
Easing: cubic-bezier(0.4, 0, 0.6, 1)
Loop: infinite
```

### **Ping Animation (Listening Rings)**
```css
@keyframes ping {
  0% { transform: scale(1); opacity: 1; }
  75%, 100% { transform: scale(2); opacity: 0; }
}
Duration: 1s
Easing: cubic-bezier(0, 0, 0.2, 1)
Loop: infinite
```

### **Waveform Animation**
```css
transition: height 150ms ease-out
Height: Math.max(8, audioLevel * 64 * (1 + Math.sin(time + index)))
```

### **Speaking Dots**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
Dot 1: delay 0ms
Dot 2: delay 200ms
Dot 3: delay 400ms
```

---

## 🎯 Interactive Elements

### **Mic Button States**
```
Idle:       Soft pulse, clickable
Listening:  Bright pulse + rings, clickable (to stop)
Processing: Disabled, 50% opacity
Speaking:   Disabled, 50% opacity
```

### **Close Button**
```
Default:    White/70 opacity
Hover:      White/100 opacity + bg-white/10
Active:     Scale 0.95
```

### **Transcript Display**
```
Interim:    White/70 opacity, italic
Final:      White/100 opacity, normal
Max width:  md (28rem)
```

---

## 📱 Responsive Behavior

### **Mobile (< 768px)**
- Logo: 128px
- Mic: 80px
- Text: 3xl
- Waveform: 16 bars
- Particles: Smaller (288px)

### **Desktop (≥ 768px)**
- Logo: 160px
- Mic: 96px
- Text: 4xl
- Waveform: 20 bars
- Particles: Larger (384px, 600px)

---

## 🎨 Accessibility

### **Color Contrast**
- Text on dark background: WCAG AAA (>7:1)
- Button labels: WCAG AA (>4.5:1)

### **Touch Targets**
- All buttons: ≥44px (WCAG 2.1 AA)
- Mic button: 80px+ (generous target)

### **Screen Readers**
- Aria labels on all buttons
- Live region for state changes
- Semantic HTML structure

---

## 🎉 Final Result

A **beautiful**, **immersive**, **calming** voice experience that feels:
- ✨ Futuristic (neon gradients, smooth animations)
- 🧘 Calming (soft colors, gentle movements)
- 🎨 Branded (Aira colors, logo prominence)
- 📱 Responsive (works on all devices)
- ♿ Accessible (WCAG compliant)

**Live at**: https://airasupport.com/chat 🎙️

