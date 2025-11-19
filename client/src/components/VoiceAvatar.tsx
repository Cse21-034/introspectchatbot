import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import avatarImage from "@assets/generated_images/Healthcare_assistant_avatar_portrait_5637e143.png";
import type { VoiceStatus } from "@shared/schema";

interface VoiceAvatarProps {
  status: VoiceStatus;
}

export function VoiceAvatar({ status }: VoiceAvatarProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(status === "listening" || status === "speaking");
  }, [status]);

  const getBorderColor = () => {
    switch (status) {
      case "listening":
        return "border-primary";
      case "speaking":
        return "border-chart-1";
      case "processing":
        return "border-muted";
      case "error":
        return "border-destructive";
      default:
        return "border-border";
    }
  };

  const getGlowColor = () => {
    switch (status) {
      case "listening":
        return "shadow-[0_0_30px_rgba(59,130,246,0.5)]";
      case "speaking":
        return "shadow-[0_0_30px_rgba(59,130,246,0.4)]";
      default:
        return "shadow-xl";
    }
  };

  return (
    <div className="relative" data-testid="avatar-container">
      <motion.div
        className={`w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 ${getBorderColor()} ${getGlowColor()} overflow-hidden bg-card transition-all duration-300`}
        animate={
          isAnimating
            ? {
                scale: [1, 1.05, 1],
              }
            : {
                scale: 1,
              }
        }
        transition={{
          duration: 1.2,
          repeat: isAnimating ? Infinity : 0,
          ease: "easeInOut",
        }}
        data-testid="avatar-image-container"
      >
        <img
          src={avatarImage}
          alt="Introspect AI Assistant"
          className="w-full h-full object-cover"
          data-testid="avatar-image"
        />
      </motion.div>

      {status === "listening" && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary"
          animate={{
            scale: [1, 1.3],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
          data-testid="listening-pulse"
        />
      )}

      {status === "processing" && (
        <div className="absolute inset-0 flex items-center justify-center" data-testid="processing-indicator">
          <motion.div
            className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      )}
    </div>
  );
}
