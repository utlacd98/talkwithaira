/**
 * Chat Encryption Utility
 * Encrypts and decrypts chat conversations using AES-256-GCM
 */

import crypto from "crypto"

const ENCRYPTION_KEY = process.env.CHAT_ENCRYPTION_KEY || "default-dev-key-32-chars-long-!!!"

// Ensure key is exactly 32 bytes for AES-256
function getEncryptionKey(): Buffer {
  const key = ENCRYPTION_KEY.padEnd(32, "0").slice(0, 32)
  return Buffer.from(key)
}

export interface EncryptedData {
  iv: string
  authTag: string
  encryptedData: string
  algorithm: string
}

/**
 * Encrypt chat data
 * @param data - Data to encrypt (will be JSON stringified)
 * @returns Encrypted data with IV and auth tag
 */
export function encryptChat(data: unknown): EncryptedData {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv)

    const jsonData = JSON.stringify(data)
    let encrypted = cipher.update(jsonData, "utf-8", "hex")
    encrypted += cipher.final("hex")

    const authTag = cipher.getAuthTag()

    return {
      iv: iv.toString("hex"),
      authTag: authTag.toString("hex"),
      encryptedData: encrypted,
      algorithm: "aes-256-gcm",
    }
  } catch (error) {
    console.error("[Encryption] Error encrypting chat:", error)
    throw new Error("Failed to encrypt chat data")
  }
}

/**
 * Decrypt chat data
 * @param encryptedData - Encrypted data object with IV and auth tag
 * @returns Decrypted data (parsed from JSON)
 */
export function decryptChat(encryptedData: EncryptedData): unknown {
  try {
    const key = getEncryptionKey()
    const iv = Buffer.from(encryptedData.iv, "hex")
    const authTag = Buffer.from(encryptedData.authTag, "hex")

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encryptedData.encryptedData, "hex", "utf-8")
    decrypted += decipher.final("utf-8")

    return JSON.parse(decrypted)
  } catch (error) {
    console.error("[Encryption] Error decrypting chat:", error)
    throw new Error("Failed to decrypt chat data - data may be corrupted or key is incorrect")
  }
}

/**
 * Encrypt chat messages array
 * @param messages - Array of chat messages
 * @returns Encrypted messages
 */
export function encryptMessages(messages: unknown[]): EncryptedData {
  return encryptChat(messages)
}

/**
 * Decrypt chat messages array
 * @param encryptedData - Encrypted messages object
 * @returns Decrypted messages array
 */
export function decryptMessages(encryptedData: EncryptedData): unknown[] {
  const decrypted = decryptChat(encryptedData)
  if (!Array.isArray(decrypted)) {
    throw new Error("Decrypted data is not an array")
  }
  return decrypted
}

/**
 * Encrypt a single message
 * @param message - Message to encrypt
 * @returns Encrypted message
 */
export function encryptMessage(message: unknown): EncryptedData {
  return encryptChat(message)
}

/**
 * Decrypt a single message
 * @param encryptedData - Encrypted message object
 * @returns Decrypted message
 */
export function decryptMessage(encryptedData: EncryptedData): unknown {
  return decryptChat(encryptedData)
}

/**
 * Check if data is encrypted
 * @param data - Data to check
 * @returns True if data appears to be encrypted
 */
export function isEncrypted(data: unknown): data is EncryptedData {
  if (typeof data !== "object" || data === null) {
    return false
  }

  const obj = data as Record<string, unknown>
  return (
    typeof obj.iv === "string" &&
    typeof obj.authTag === "string" &&
    typeof obj.encryptedData === "string" &&
    obj.algorithm === "aes-256-gcm"
  )
}

/**
 * Encrypt entire chat object
 * @param chat - Chat object to encrypt
 * @returns Chat object with encrypted messages
 */
export function encryptChatObject(chat: {
  id: string
  title: string
  messages: unknown[]
  tags: string[]
  createdAt: string
  updatedAt: string
  messageCount: number
}): {
  id: string
  title: string
  messages: EncryptedData
  tags: string[]
  createdAt: string
  updatedAt: string
  messageCount: number
  encrypted: boolean
} {
  return {
    ...chat,
    messages: encryptMessages(chat.messages),
    encrypted: true,
  }
}

/**
 * Decrypt entire chat object
 * @param chat - Chat object with encrypted messages
 * @returns Chat object with decrypted messages
 */
export function decryptChatObject(chat: {
  id: string
  title: string
  messages: EncryptedData | unknown[]
  tags: string[]
  createdAt: string
  updatedAt: string
  messageCount: number
  encrypted?: boolean
}): {
  id: string
  title: string
  messages: unknown[]
  tags: string[]
  createdAt: string
  updatedAt: string
  messageCount: number
  encrypted: boolean
} {
  const messages = isEncrypted(chat.messages) ? decryptMessages(chat.messages) : chat.messages

  return {
    ...chat,
    messages: Array.isArray(messages) ? messages : [],
    encrypted: false,
  }
}

