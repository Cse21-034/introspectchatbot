import { useState, useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { VoiceAvatar } from "@/components/VoiceAvatar";
import { VoiceControls } from "@/components/VoiceControls";
import { ChatInterface } from "@/components/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage, VoiceStatus, ChatResponse, TranscriptionResponse } from "@shared/schema";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest<ChatResponse>("POST", "/api/chat", {
        message,
        conversationHistory: messages.slice(-5),
      });
      return response;
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
        audioUrl: data.audioUrl,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (data.audioUrl) {
        playAudio(data.audioUrl);
      } else {
        setVoiceStatus("idle");
      }
    },
    onError: (error) => {
      setVoiceStatus("error");
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
      });
      setTimeout(() => setVoiceStatus("idle"), 2000);
    },
  });

  const transcribeMutation = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      return response.json() as Promise<TranscriptionResponse>;
    },
    onSuccess: (data) => {
      if (data.text.trim()) {
        const userMessage: ChatMessage = {
          id: `${Date.now()}-user`,
          role: "user",
          content: data.text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        chatMutation.mutate(data.text);
      } else {
        setVoiceStatus("error");
        toast({
          variant: "destructive",
          title: "No speech detected",
          description: "Please try speaking again",
        });
        setTimeout(() => setVoiceStatus("idle"), 2000);
      }
    },
    onError: (error) => {
      setVoiceStatus("error");
      toast({
        variant: "destructive",
        title: "Transcription failed",
        description: error instanceof Error ? error.message : "Failed to transcribe audio",
      });
      setTimeout(() => setVoiceStatus("idle"), 2000);
    },
  });

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        
        setVoiceStatus("processing");
        transcribeMutation.mutate(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setVoiceStatus("listening");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice input",
      });
      setVoiceStatus("error");
      setTimeout(() => setVoiceStatus("idle"), 2000);
    }
  }, [toast, transcribeMutation]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const sendTextMessage = useCallback((text: string) => {
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setVoiceStatus("processing");
    chatMutation.mutate(text);
  }, [chatMutation]);

  const playAudio = useCallback((audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadeddata = () => {
      setVoiceStatus("speaking");
      audio.play().catch((error) => {
        console.error("Audio playback failed:", error);
        setVoiceStatus("idle");
      });
    };

    audio.onended = () => {
      setVoiceStatus("idle");
    };

    audio.onerror = () => {
      console.error("Audio loading failed");
      setVoiceStatus("idle");
    };
  }, []);

  const handlePlayAudio = useCallback((audioUrl: string) => {
    playAudio(audioUrl);
  }, [playAudio]);

  return (
    <div className="flex flex-col h-screen bg-background" data-testid="page-home">
      {/* Header with Logo */}
      <div className="w-full bg-sidebar border-b border-sidebar-border px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold font-heading text-sidebar-foreground">
            INTROSPECT
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-Powered Malaria Diagnostics
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Avatar - Updated to be larger on lg screens */}
        <div className="mb-8 lg:scale-150 transition-transform duration-300 origin-center">
          <VoiceAvatar status={voiceStatus} />
        </div>

        {/* Chat Messages (if any) */}
        {messages.length > 0 && (
          <div className="w-full max-w-4xl mb-6 flex-1 overflow-y-auto">
            <ChatInterface
              messages={messages}
              isLoading={chatMutation.isPending || transcribeMutation.isPending}
              onPlayAudio={handlePlayAudio}
            />
          </div>
        )}
      </div>

      {/* Input Controls - Fixed at Bottom */}
      <div className="w-full">
        <VoiceControls
          status={voiceStatus}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          onSendText={sendTextMessage}
          disabled={chatMutation.isPending || transcribeMutation.isPending}
        />
      </div>
    </div>
  );
}
