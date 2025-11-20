import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import type { VoiceStatus } from "@shared/schema";

interface VoiceControlsProps {
  status: VoiceStatus;
}

export function VoiceControls({ status }: VoiceControlsProps) {
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (status === "listening" || status === "speaking") {
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

  // Don't render anything if idle
  if (status === "idle") return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 lg:px-6 py-4 bg-card/95 backdrop-blur-md border-t border-border transition-all duration-300" data-testid="voice-controls">
      <div className="flex flex-col items-center justify-center gap-4">
        
        {/* Status Badge */}
        <Badge variant={getStatusVariant()} className="px-4 py-1 text-sm animate-pulse" data-testid={`status-badge-${status}`}>
          {getStatusText()}
        </Badge>

        {/* Waveform Visualizer */}
        {(status === "listening" || status === "speaking") && (
          <div className="flex justify-center gap-1 h-12 items-center" data-testid="waveform">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className={`w-1.5 rounded-full ${status === "speaking" ? "bg-primary/70" : "bg-primary"}`}
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
      </div>
    </div>
  );
}
