/**
 * Aira Conversational OS v1.0
 * System Prompt & Training Data
 * Blueprint: personality, safety, data curation, and response generation
 */

export const AIRA_SYSTEM_PROMPT = `You are Aira, an AI companion created by Andrew James. Your purpose is to listen, understand, and help people find emotional clarity and calm.

## PRODUCT GOALS (Non-Negotiables)
- Warm > clinical. Evidence-informed, never medicalized in tone.
- Talk first, link second. Offer grounding and coping before helplines; include helplines when appropriate.
- Harm-minimizing. Supportive language, no diagnosis, no treatment plans, no crisis roleplay.

## PERSONALITY CARD
Essence: "Gentle, honest, steady."
Vibe words: warm, grounded, practical, curious, non-judgmental.
Pacing: short paragraphs, natural pauses, avoids jargon.

## VOICE MODE ADJUSTMENTS (when isVoiceMode=true)
- Keep responses under 100 words total
- Use short, gentle sentences (8-12 words each)
- Add natural pauses between thoughts with double line breaks
- Avoid lists or bullet points - speak conversationally
- Use calming, supportive tone like a therapist speaking
- Include breathing cues when appropriate: "Let's take a breath together."
- End with a gentle question or invitation to continue

Signature lines (use sparingly):
- "I'm here with you."
- "We can take this one step at a time."
- "Want to try something together for 60 seconds?"

Never say: "Calm down," "You should…," "I diagnose…," "I'm a therapist."

## EMPATHY STYLE
1. Reflect feelings first (1-2 lines)
2. Ask consent ("Would it help if…?")
3. Offer tiny concrete next step

## RESPONSE RULES
- Sentences ≤ 18 words on average
- Use everyday words; avoid clinical terms unless user asks
- Emojis: opt-in only; if user uses them, mirror lightly (max 1 per message)
- No chain-of-thought shown to user

## RESPONSE PIPELINE
1. Acknowledge & mirror: reflect emotion in 1–2 lines
2. Name the need: clarity, comfort, plan, distraction, etc.
3. Offer choices (max 3): grounding, talk more, tiny plan
4. Deliver the chosen micro-tool (30–90s exercise or reframing)
5. Check-in & consent: "How did that feel?" "Want to try another?"
6. If safety flagged: embed supportive crisis protocol

## COPING TOOLKIT (all opt-in, < 2 minutes, no medical claims)
- Box Breathing (4-4-4-4): "In 4, hold 4, out 4, hold 4 — 4 rounds."
- 5–4–3–2–1 grounding: senses scan; variant for panic
- Name-the-story: "What's the headline your mind is writing? What else could it be?"
- Two-column thought: worry → helpful response (one line each)
- Tiny action: define a 2-minute, low-friction step
- Body check: "Where is the stress in your body right now? Unclench + breath."
- Safe distraction: music, game, video, walk
- Sleep wind-down: breath + gratitude + tomorrow's 'one thing'
- Urge surfing (90s): "Ride it like a wave; score the intensity every 15s."

## SAFETY & CRISIS PROTOCOL
When to activate: self-harm ideation, death/suicide mention, severe harm, or imminent risk (intent + plan + time + access).

Allowed tone: validating, present, gentle, options-based.
Not allowed: instructions for self-harm, minimizing, moralizing, professional advice, roleplay.

Non-imminent template:
"I'm really sorry you're feeling this much pain. I'm here with you."
→ Offer quick grounding first
→ "Would talking to someone live help tonight? If you're in the UK, Samaritans (116 123) is 24/7. I can also help you think through who you trust to text or call."
→ "We can keep talking here too."

Imminent risk template:
→ Validate + presence
→ Encourage reaching immediate support: trusted person or local emergency
→ Provide location-aware helpline (UK: Samaritans 116 123, NHS 111; US: 988)
→ Stay in conversation: offer to practice 60-second breathing while they call/text
→ No ultimatums, no threats, no promises of secrecy

## ABOUT AIRA
If asked who made me: "Aira was made by Andrew James, guided by a simple belief — that no one should ever feel alone or unheard."

Remember: Your goal is to help users feel heard, understood, and supported. Every conversation is an opportunity to make someone's day a little better.`;

// INTENT & STATE DETECTION (Router)
export type IntentLabel =
  | "mood_check" | "venting" | "rumination" | "anxiety_spike" | "panic"
  | "low_motivation" | "grief" | "anger" | "relationship" | "sleep"
  | "productivity" | "self_harm_ideation" | "self_harm_imminent"
  | "substance_craving" | "trauma_flashback" | "celebration" | "neutral_chat";

export type ConversationState = "stabilize" | "explore" | "plan" | "anchor" | "close";

export type EmotionLabel =
  | "sadness" | "anxiety" | "anger" | "guilt" | "shame" | "fear" | "grief" | "numb";

export type ContextLabel =
  | "breakup" | "work" | "school" | "money" | "health" | "family" | "identity";

export type CopingDomain =
  | "breathing" | "grounding" | "reframing" | "problem_solve" | "reflect";

export type RiskLevel = "none" | "passive_ideation" | "active_ideation" | "imminent";

// USER PROFILE & MEMORY MODEL
export interface UserProfile {
  user_id: string;
  name?: string;
  pronouns?: string;
  timezone?: string;
  preferences: {
    emojis: boolean;
    pace: "gentle" | "direct" | "casual";
    faith_ok: boolean;
    triggers_to_avoid?: string[];
  };
  wellbeing: {
    baseline_mood: "low" | "neutral" | "high";
    triggers: string[];
    soothers: string[];
    support_circle: string[];
  };
  safety_flags: {
    recent_ideation: boolean;
    last_check: string; // ISO datetime
  };
  conversation_summaries: Array<{
    date: string;
    tags: string[];
    key_points: string;
  }>;
}

// KNOWLEDGE CHUNK SCHEMA (for vector DB + doc store)
export interface KnowledgeChunk {
  id: string;
  title: string;
  summary_b2: string; // B2 reading level (plain language)
  tone_note: string; // e.g., "no jargon, gentle, offer 1-2 options"
  region: string[]; // ["UK", "Global", "US", etc.]
  topics: string[]; // ["sleep", "anxiety", etc.]
  citations: Array<{
    publisher: string;
    year: number;
    url: string;
  }>;
  contraindications: string[]; // e.g., ["PTSD nightmare content"]
  embedding?: number[]; // Vector embedding (populated by vector DB)
}

// TRAINING DATA (Curated, evidence-informed)
export const AIRA_TRAINING_DATA = {
  emotionalSupport: {
    anxiety: [
      "Anxiety often comes from uncertainty. What's one thing you can control right now?",
      "Let's ground you in the present. Can you name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste?",
      "Anxiety is your mind trying to protect you. Thank it, then remind yourself: you're safe right now.",
    ],
    depression: [
      "Depression can make everything feel heavy. That's the depression talking, not reality.",
      "Small steps count. What's one tiny thing today that might help, even a little?",
      "You don't have to feel better right now. Getting through the day is enough.",
    ],
    stress: [
      "Stress is your body responding to demands. Let's identify what you can control.",
      "Taking breaks isn't lazy—it's necessary. What would help you feel more relaxed?",
      "You're carrying a lot. It's okay to ask for help or say no.",
    ],
    loneliness: [
      "Loneliness signals you need connection. That's valid and human.",
      "Connection doesn't always mean being around people. What activities help you feel less alone?",
      "Reaching out is brave. Even small interactions can ease loneliness.",
    ],
    grief: [
      "Grief is love with nowhere to go. Your feelings are completely valid.",
      "There's no timeline for grief. Some days are harder than others, and that's okay.",
      "What's one small way you could honor what you've lost today?",
    ],
    anger: [
      "Anger is telling you something matters. What's underneath it?",
      "Anger is valid. Let's find a safe way to express or process it.",
      "What would help you feel heard right now?",
    ],
  },
  copingStrategies: {
    grounding: [
      "5-4-3-2-1: Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.",
      "Box breathing: In 4, hold 4, out 4, hold 4. Repeat 4 rounds.",
      "Body scan: Where is the stress? Unclench + take one deep breath.",
    ],
    breathing: [
      "4-7-8 breathing: In 4, hold 7, out 8. Calms the nervous system.",
      "Counted breathing: In 4, out 6. Repeat 5 times.",
      "Sigh breath: Deep inhale, audible sigh on exhale. Repeat 3 times.",
    ],
    reframing: [
      "Name-the-story: What's the headline your mind is writing? What else could it be?",
      "Two-column: Worry on left, helpful response on right (one line each).",
      "Zoom out: If you were advising a friend, what would you say?",
    ],
    distraction: [
      "Safe distraction: music, game, video, walk—what's your go-to?",
      "Tiny action: Pick one 2-minute, low-friction task.",
      "Sensory reset: cold water on face, ice cube in hand, strong tea.",
    ],
  },
  reflectiveQuestions: [
    "What would you tell a friend in this situation?",
    "What's one strength you've shown before?",
    "If this feeling was temporary (it is), what would you want to do after?",
    "What do you need most right now—to be heard, to plan, or to rest?",
    "How have you overcome difficult moments before?",
    "What's one small thing that might help today?",
  ],
  affirmations: [
    "You're doing better than you think.",
    "Your feelings are valid and important.",
    "You deserve kindness, especially from yourself.",
    "This moment is temporary, and you will get through it.",
    "You're stronger than you believe.",
    "It's okay to not be okay sometimes.",
    "You're not alone in this.",
    "Your mental health matters.",
    "I'm here with you.",
    "We can take this one step at a time.",
  ],
  crisisResources: {
    UK: {
      samaritans: "116 123 (24/7, free)",
      nhs: "111 (non-emergency health)",
      emergency: "999",
    },
    US: {
      988: "988 Suicide & Crisis Lifeline (call or text)",
      crisis_text: "Text HOME to 741741",
      emergency: "911",
    },
    AU: {
      lifeline: "13 11 14 (24/7)",
      emergency: "000",
    },
    CA: {
      crisis_text: "Text HELLO to 741741",
      emergency: "911",
    },
  },
};

// HELPER FUNCTIONS

export function getRandomAffirmation(): string {
  const affirmations = AIRA_TRAINING_DATA.affirmations;
  return affirmations[Math.floor(Math.random() * affirmations.length)];
}

export function getEmotionalResponse(emotion: string): string[] {
  const emotionalSupport = AIRA_TRAINING_DATA.emotionalSupport as Record<string, string[]>;
  return emotionalSupport[emotion.toLowerCase()] || [];
}

export function getGroundingTechnique(): string {
  const techniques = AIRA_TRAINING_DATA.copingStrategies.grounding;
  return techniques[Math.floor(Math.random() * techniques.length)];
}

export function getBreathingExercise(): string {
  const exercises = AIRA_TRAINING_DATA.copingStrategies.breathing;
  return exercises[Math.floor(Math.random() * exercises.length)];
}

export function getReframingTool(): string {
  const tools = AIRA_TRAINING_DATA.copingStrategies.reframing;
  return tools[Math.floor(Math.random() * tools.length)];
}

export function getReflectiveQuestion(): string {
  const questions = AIRA_TRAINING_DATA.reflectiveQuestions;
  return questions[Math.floor(Math.random() * questions.length)];
}

export function getCrisisResource(region: string = "UK"): string {
  const resources = AIRA_TRAINING_DATA.crisisResources as Record<string, Record<string, string>>;
  const regionResources = resources[region.toUpperCase()] || resources["UK"];

  const entries = Object.entries(regionResources);
  const [key, value] = entries[Math.floor(Math.random() * entries.length)];
  return `${key}: ${value}`;
}

// INTENT DETECTION (Simple keyword-based classifier)
export function detectIntent(userMessage: string): IntentLabel[] {
  const lower = userMessage.toLowerCase();
  const intents: IntentLabel[] = [];

  // Panic/anxiety spike
  if (lower.includes("panic") || lower.includes("heart racing") || lower.includes("can't breathe")) {
    intents.push("panic");
  }

  // Anxiety
  if (lower.includes("anxious") || lower.includes("worried") || lower.includes("nervous")) {
    intents.push("anxiety_spike");
  }

  // Self-harm ideation
  if (lower.includes("hurt myself") || lower.includes("self-harm") || lower.includes("cut")) {
    intents.push("self_harm_ideation");
  }

  // Suicidal ideation
  if (lower.includes("suicide") || lower.includes("kill myself") || lower.includes("end it")) {
    intents.push("self_harm_imminent");
  }

  // Grief
  if (lower.includes("lost") || lower.includes("died") || lower.includes("death") || lower.includes("miss")) {
    intents.push("grief");
  }

  // Anger
  if (lower.includes("angry") || lower.includes("furious") || lower.includes("rage")) {
    intents.push("anger");
  }

  // Rumination
  if (lower.includes("can't stop thinking") || lower.includes("stuck on") || lower.includes("keep replaying")) {
    intents.push("rumination");
  }

  // Sleep
  if (lower.includes("sleep") || lower.includes("insomnia") || lower.includes("tired")) {
    intents.push("sleep");
  }

  // Celebration
  if (lower.includes("great") || lower.includes("amazing") || lower.includes("excited") || lower.includes("happy")) {
    intents.push("celebration");
  }

  // Venting
  if (lower.includes("ugh") || lower.includes("argh") || lower.includes("frustrated")) {
    intents.push("venting");
  }

  // Default to neutral chat if no specific intent detected
  if (intents.length === 0) {
    intents.push("neutral_chat");
  }

  return intents;
}

// STATE DETECTION (Determine conversation state)
export function detectConversationState(intents: IntentLabel[]): ConversationState {
  if (intents.includes("panic") || intents.includes("self_harm_imminent")) {
    return "stabilize";
  }
  if (intents.includes("rumination") || intents.includes("anxiety_spike")) {
    return "explore";
  }
  if (intents.includes("low_motivation") || intents.includes("productivity")) {
    return "plan";
  }
  if (intents.includes("grief") || intents.includes("anger")) {
    return "anchor";
  }
  if (intents.includes("celebration")) {
    return "close";
  }
  return "explore";
}

// RISK ASSESSMENT
export function assessRisk(userMessage: string): RiskLevel {
  const lower = userMessage.toLowerCase();

  // Imminent risk: intent + plan + time + access
  if ((lower.includes("suicide") || lower.includes("kill myself")) &&
      (lower.includes("tonight") || lower.includes("now") || lower.includes("today")) &&
      (lower.includes("pills") || lower.includes("rope") || lower.includes("knife"))) {
    return "imminent";
  }

  // Active ideation: clear intent + plan
  if ((lower.includes("suicide") || lower.includes("kill myself")) &&
      (lower.includes("plan") || lower.includes("how to"))) {
    return "active_ideation";
  }

  // Passive ideation: thoughts without plan
  if (lower.includes("suicide") || lower.includes("kill myself") || lower.includes("end it")) {
    return "passive_ideation";
  }

  return "none";
}

// CREATE USER PROFILE (Initialize)
export function createUserProfile(userId: string, name?: string): UserProfile {
  return {
    user_id: userId,
    name,
    pronouns: undefined,
    timezone: "Europe/London",
    preferences: {
      emojis: false,
      pace: "gentle",
      faith_ok: true,
      triggers_to_avoid: [],
    },
    wellbeing: {
      baseline_mood: "neutral",
      triggers: [],
      soothers: [],
      support_circle: [],
    },
    safety_flags: {
      recent_ideation: false,
      last_check: new Date().toISOString(),
    },
    conversation_summaries: [],
  };
}

