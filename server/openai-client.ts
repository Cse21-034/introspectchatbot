import OpenAI from "openai";
import { INTROSPECT_KNOWLEDGE } from "./knowledge/introspect-info";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function generateChatResponse(
  userMessage: string,
  conversationHistory: ChatMessage[] = []
): Promise<string> {
  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: INTROSPECT_KNOWLEDGE,
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      {
        role: "user",
        content: userMessage,
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
      messages,
      max_completion_tokens: 250, // Limit for concise responses and reliable audio delivery across all platforms
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("OpenAI chat error:", error);
    throw new Error("Failed to generate chat response");
  }
}

export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
  try {
    // Create a File-like object from the buffer
    const audioFile = new File([audioBuffer], "audio.webm", { type: "audio/webm" });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    return transcription.text;
  } catch (error) {
    console.error("OpenAI transcription error:", error);
    throw new Error("Failed to transcribe audio");
  }
}

export async function generateSpeech(text: string): Promise<Buffer> {
  try {
    const mp3Response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova", // Natural, friendly female voice
      input: text,
      speed: 1.0,
    });

    const arrayBuffer = await mp3Response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("OpenAI TTS error:", error);
    throw new Error("Failed to generate speech");
  }
}
