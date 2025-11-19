import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { generateChatResponse, transcribeAudio, generateSpeech } from "./openai-client";
import { z } from "zod";
import { randomUUID } from "crypto";

// Set up multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Validation schemas
const chatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

// Audio storage with TTL for development/single-instance deployments
// NOTE: For production serverless/multi-instance deployments (Vercel/Render),
// replace this with persistent storage (Vercel Blob, S3, etc.)
interface AudioEntry {
  buffer: Buffer;
  expiresAt: number;
}

const audioStore = new Map<string, AudioEntry>();

// Clean up expired audio entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of audioStore.entries()) {
    if (entry.expiresAt < now) {
      audioStore.delete(id);
    }
  }
}, 5 * 60 * 1000);

// Helper to store audio with 1-hour TTL
function storeAudio(buffer: Buffer): string {
  const id = randomUUID();
  audioStore.set(id, {
    buffer,
    expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
  });
  return id;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint - generates AI response using GPT-5 with Introspect knowledge
  app.post("/api/chat", async (req, res) => {
    try {
      const validated = chatRequestSchema.parse(req.body);
      
      // Generate text response
      const responseText = await generateChatResponse(
        validated.message,
        validated.conversationHistory || []
      );

      // Generate audio for the response
      let audioUrl: string | undefined;
      try {
        const audioBuffer = await generateSpeech(responseText);
        const audioId = storeAudio(audioBuffer);
        audioUrl = `/api/audio/${audioId}`;
      } catch (audioError) {
        console.error("TTS generation failed:", audioError);
        // Continue without audio if TTS fails
      }

      res.json({
        response: responseText,
        audioUrl,
      });
    } catch (error) {
      console.error("Chat error:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ 
          error: error instanceof Error ? error.message : "Failed to process chat request" 
        });
      }
    }
  });

  // Transcription endpoint - converts voice to text using Whisper
  app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const transcribedText = await transcribeAudio(req.file.buffer);

      res.json({
        text: transcribedText,
      });
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : "Failed to transcribe audio" 
      });
    }
  });

  // Audio streaming endpoint - serves generated TTS audio
  // NOTE: For production on Vercel/Render, replace with persistent storage
  app.get("/api/audio/:id", (req, res) => {
    const audioId = req.params.id;
    const entry = audioStore.get(audioId);

    if (!entry) {
      return res.status(404).json({ error: "Audio not found or expired" });
    }

    // Check if expired
    if (entry.expiresAt < Date.now()) {
      audioStore.delete(audioId);
      return res.status(404).json({ error: "Audio expired" });
    }

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": entry.buffer.length,
      "Cache-Control": "public, max-age=3600",
    });
    res.send(entry.buffer);
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Introspect AI Chatbot API is running" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
