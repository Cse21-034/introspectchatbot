import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Send, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { VoiceStatus } from "@shared/schema";

interface VoiceControlsProps {
  status: VoiceStatus;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onSendText: (text: string) => void;
  disabled?: boolean;
}

export function VoiceControls({
  status,
  onStartRecording,
  onStopRecording,
  onSendText,
  disabled = false,
}: VoiceControlsProps) {
  const [textInput, setTextInput] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);

  const handleSendText = () => {
    if (textInput.trim()) {
      onSendText(textInput);
      setTextInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  useEffect(() => {
    if (status === "listening") {
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [status]);

  const getStatusText = () => {
    switch (status) {
      case "listening":
        return "Listening...";
      case "processing":
        return "Processing...";
      case "speaking":
        return "Speaking...";
      case "error":
        return "Error occurred";
      default:
        return "";
    }
  };

  const getStatusVariant = () => {
    switch (status) {
      case "listening":
        return "default";
      case "processing":
        return "secondary";
      case "speaking":
        return "default";
      case "error":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 lg:px-6 py-4 bg-card/95 backdrop-blur-md border-t border-border" data-testid="voice-controls">
      {status !== "idle" && (
        <div className="flex justify-center mb-3">
          <Badge variant={getStatusVariant()} className="px-3 py-1 text-xs" data-testid={`status-badge-${status}`}>
            {getStatusText()}
          </Badge>
        </div>
      )}

      {status === "listening" && (
        <div className="flex justify-center gap-1 mb-4" data-testid="waveform">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 bg-primary rounded-full"
              animate={{
                height: [`${10 + Math.random() * 20}px`, `${10 + (audioLevel / 100) * 40}px`],
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                repeatType: "reverse",
                delay: i * 0.05,
              }}
            />
          ))}
        </div>
      )}

      <div className="flex gap-3 items-center">
        <div className="relative">
          {status === "listening" ? (
            <Button
              size="icon"
              variant="destructive"
              className="w-16 h-16 rounded-full"
              onClick={onStopRecording}
              disabled={disabled}
              data-testid="button-stop-recording"
            >
              <Square className="w-6 h-6" />
            </Button>
          ) : (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="icon"
                variant="default"
                className="w-16 h-16 rounded-full"
                onClick={onStartRecording}
                disabled={disabled || status === "processing" || status === "speaking"}
                data-testid="button-start-recording"
              >
                <Mic className="w-7 h-7" />
              </Button>
            </motion.div>
          )}
        </div>

        <div className="flex-1 flex gap-2">
          <Input
            type="text"
            placeholder="Or type your question here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || status === "processing" || status === "speaking"}
            className="flex-1"
            data-testid="input-text-message"
          />
          <Button
            size="icon"
            onClick={handleSendText}
            disabled={!textInput.trim() || disabled || status === "processing" || status === "speaking"}
            data-testid="button-send-text"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center mt-3">
        Click the microphone to speak or type your question
      </p>
    </div>
  );
}
