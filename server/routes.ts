import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { generateChatResponse, transcribeAudio, generateSpeech } from "./openai-client";
import { z } from "zod";

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

// Note: Audio is returned as base64 data URLs for serverless compatibility
// This works across all platforms (Vercel, Render, Replit, localhost)

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

      // Generate audio for the response and return as base64 data URL
      // This ensures compatibility with all platforms including serverless (Vercel)
      let audioUrl: string | undefined;
      try {
        const audioBuffer = await generateSpeech(responseText);
        const base64Audio = audioBuffer.toString('base64');
        audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
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

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Introspect AI Chatbot API is running" });
  });

  const httpServer = createServer(app);

  return httpServer;
}
