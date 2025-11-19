import { motion } from "framer-motion";
import { User, Bot, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ChatMessage as ChatMessageType } from "@shared/schema";
import { format } from "date-fns";

interface ChatMessageProps {
  message: ChatMessageType;
  onPlayAudio?: (audioUrl: string) => void;
}

export function ChatMessage({ message, onPlayAudio }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} mb-4`}
      data-testid={`message-${message.role}-${message.id}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center" data-testid="icon-bot">
          <Bot className="w-5 h-5 text-primary" />
        </div>
      )}

      <div
        className={`max-w-md lg:max-w-xl px-4 py-3 rounded-2xl shadow-sm ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card border border-card-border"
        }`}
      >
        <p className={`text-base ${isUser ? "text-primary-foreground" : "text-card-foreground"}`} data-testid={`text-content-${message.id}`}>
          {message.content}
        </p>

        <div className={`flex items-center justify-between mt-2 gap-3 ${isUser ? "" : "flex-row-reverse"}`}>
          <span className={`text-xs ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`} data-testid={`text-timestamp-${message.id}`}>
            {format(new Date(message.timestamp), "h:mm a")}
          </span>

          {!isUser && message.audioUrl && onPlayAudio && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2"
              onClick={() => onPlayAudio(message.audioUrl!)}
              data-testid={`button-play-audio-${message.id}`}
            >
              <Volume2 className="w-3 h-3 mr-1" />
              <span className="text-xs">Play</span>
            </Button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center" data-testid="icon-user">
          <User className="w-5 h-5 text-primary-foreground" />
        </div>
      )}
    </motion.div>
  );
}
