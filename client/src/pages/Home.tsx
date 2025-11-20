import { useState, useCallback, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { VoiceAvatar } from "@/components/VoiceAvatar";
import { VoiceControls } from "@/components/VoiceControls";
import { ChatInterface } from "@/components/ChatInterface";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mic, MicOff } from "lucide-react"; // Import icons for the toggle
import { Button } from "@/components/ui/button";
import type { ChatMessage, VoiceStatus, ChatResponse, TranscriptionResponse } from "@shared/schema";

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
  const [isRecording, setIsRecording] = useState(false);
  const [isHandsFree, setIsHandsFree] = useState(false); // New state for Hands Free mode

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Refs for Voice Activity Detection (VAD)
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasSpokenRef = useRef(false); // Tracks if user actually said something

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
        // If no audio, restart listening immediately if in hands-free
        if (isHandsFree) {
          setTimeout(() => startRecording(), 500);
        }
      }
    },
    onError: (error) => {
      setVoiceStatus("error");
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response",
      });
      setIsHandsFree(false); // Stop loop on error
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
        // If silence was recorded
        setVoiceStatus("idle");
        toast({
          title: "No speech detected",
          description: "Listening again...",
          duration: 1000,
        });
        // If hands free, try again
        if (isHandsFree) {
          setTimeout(() => startRecording(), 500);
        }
      }
    },
    onError: (error) => {
      setVoiceStatus("error");
      toast({
        variant: "destructive",
        title: "Transcription failed",
        description: error instanceof Error ? error.message : "Failed to transcribe audio",
      });
      setIsHandsFree(false); // Stop loop on error
      setTimeout(() => setVoiceStatus("idle"), 2000);
    },
  });

  // Function to analyze audio volume for silence detection
  const setupAudioAnalysis = (stream: MediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const audioContext = audioContextRef.current;
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    analyser.minDecibels = -85;
    analyser.smoothingTimeConstant = 0.8;

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    
    analyserRef.current = analyser;
    sourceRef.current = source;
    hasSpokenRef.current = false;

    checkSilence();
  };

  const checkSilence = () => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average volume
    const arraySum = dataArray.reduce((a, b) => a + b, 0);
    const average = arraySum / dataArray.length;

    // Threshold for speech (adjustable)
    const silenceThreshold = 15; 

    if (average > silenceThreshold) {
      // User is speaking
      hasSpokenRef.current = true;
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } else if (hasSpokenRef.current) {
      // User has spoken before, now it is silent. Start silence timer.
      if (!silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          stopRecording(); // Auto stop after 1.5s of silence
        }, 1500);
      }
    }

    // Keep checking if still recording
    if (mediaRecorderRef.current?.state === "recording") {
      requestAnimationFrame(checkSilence);
    }
  };

  const startRecording = useCallback(async () => {
    try {
      if (audioRef.current) audioRef.current.pause(); // Stop AI speech if interrupted

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      setupAudioAnalysis(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        
        // Cleanup audio analysis
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        
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
        description: "Please allow microphone access.",
      });
      setIsHandsFree(false);
      setVoiceStatus("error");
      setTimeout(() => setVoiceStatus("idle"), 2000);
    }
  }, [toast, transcribeMutation]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, []);

  const sendTextMessage = useCallback((text: string) => {
    // Pause hands free loop for manual text
    setIsHandsFree(false);
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
      // THE LOOP: If hands free is on, start listening again after AI finishes
      if (isHandsFree) {
        setTimeout(() => {
          startRecording();
        }, 500); // Short delay so it doesn't hear itself
      }
    };

    audio.onerror = () => {
      console.error("Audio loading failed");
      setVoiceStatus("idle");
    };
  }, [isHandsFree, startRecording]); // Depend on isHandsFree

  const handlePlayAudio = useCallback((audioUrl: string) => {
    playAudio(audioUrl);
  }, [playAudio]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const toggleHandsFree = () => {
    setIsHandsFree(!isHandsFree);
    if (!isHandsFree) {
      toast({ title: "Hands Free Mode On", description: "Say something to start!" });
      startRecording();
    } else {
      toast({ title: "Hands Free Mode Off" });
      stopRecording();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background" data-testid="page-home">
      {/* Header with Logo */}
      <div className="w-full bg-sidebar border-b border-sidebar-border px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo Image */}
            <div className="h-14 w-14 shrink-0">
              <img 
                src="/logo.png" 
                alt="Introspect Logo" 
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading text-sidebar-foreground leading-none">
                INTROSPECT
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                AI-Powered Malaria Diagnostics
              </p>
            </div>
          </div>

          {/* Hands Free Toggle */}
          <Button 
            variant={isHandsFree ? "destructive" : "outline"}
            onClick={toggleHandsFree}
            className="gap-2"
          >
            {isHandsFree ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isHandsFree ? "Stop Conversation" : "Start Conversation"}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Avatar - Large scale (3x) on desktop screens */}
        <div className="mb-8 lg:my-24 lg:scale-[3] transition-transform duration-300 origin-center">
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
