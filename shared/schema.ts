import { z } from "zod";

// Chat message types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Message cannot be empty"),
});

export type InsertChatMessage = z.infer<typeof chatMessageSchema>;

// Voice recording status
export type VoiceStatus = "idle" | "listening" | "processing" | "speaking" | "error";

// API request/response types
export interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
}

export interface ChatResponse {
  response: string;
  audioUrl?: string;
}

export interface TranscriptionRequest {
  audio: File | Blob;
}

export interface TranscriptionResponse {
  text: string;
}
