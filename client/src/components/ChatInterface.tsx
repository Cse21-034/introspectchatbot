import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import type { ChatMessage as ChatMessageType } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  isLoading?: boolean;
  onPlayAudio?: (audioUrl: string) => void;
}

export function ChatInterface({ messages, isLoading, onPlayAudio }: ChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6" data-testid="chat-messages-container">
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center" data-testid="empty-state">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Welcome to Introspect AI Assistant
            </h2>
            <p className="text-muted-foreground max-w-md mb-6">
              I'm here to answer all your questions about Introspect's AI-powered malaria diagnostic system.
              You can speak to me or type your questions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
              <div className="p-4 rounded-lg bg-card border border-card-border text-left">
                <p className="text-sm text-muted-foreground">Try asking:</p>
                <p className="text-sm font-medium mt-1">"What is Introspect?"</p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-card-border text-left">
                <p className="text-sm text-muted-foreground">Try asking:</p>
                <p className="text-sm font-medium mt-1">"How accurate is the AI?"</p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-card-border text-left">
                <p className="text-sm text-muted-foreground">Try asking:</p>
                <p className="text-sm font-medium mt-1">"How fast are the results?"</p>
              </div>
              <div className="p-4 rounded-lg bg-card border border-card-border text-left">
                <p className="text-sm text-muted-foreground">Try asking:</p>
                <p className="text-sm font-medium mt-1">"Can it work offline?"</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onPlayAudio={onPlayAudio}
              />
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start mb-4" data-testid="loading-indicator">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
                <div className="max-w-md px-4 py-3 rounded-2xl bg-card border border-card-border">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
