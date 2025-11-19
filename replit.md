# Introspect AI Chatbot

## Overview

Introspect AI Chatbot is a voice-enabled conversational interface designed to answer questions about Introspect's AI-powered malaria diagnostic system. The application combines text and voice interactions with an animated avatar interface, providing an engaging way for users to learn about the YOLOv8-based malaria detection technology.

**Core Purpose:** Educational chatbot that explains Introspect's medical AI diagnostic platform through natural conversation, supporting both text input and voice interactions with speech-to-text and text-to-speech capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript using Vite as the build tool

**UI Component Strategy:**
- Radix UI primitives for accessible, unstyled components
- Shadcn UI component library built on top of Radix
- Tailwind CSS for styling with custom design tokens
- Framer Motion for avatar animations and transitions

**State Management:**
- TanStack Query (React Query) for server state and API data fetching
- Local React state (useState) for UI interactions and voice recording state
- No global state management needed due to simple, single-page architecture

**Voice Input System:**
- Web Speech API (MediaRecorder) for browser-based audio recording
- Audio chunks collected in-memory during recording
- Blob-based audio file creation sent to backend for transcription

**Responsive Design:**
- Desktop: Side-by-side layout with sidebar and chat interface
- Mobile: Stacked single-column layout with collapsible sidebar
- Breakpoint at 768px (lg: prefix in Tailwind)

### Backend Architecture

**Server Framework:** Express.js with TypeScript running on Node.js

**API Endpoints:**
- `POST /api/chat` - Generates AI responses using GPT-5 with conversation history
- `POST /api/transcribe` - Converts audio (WebM) to text using Whisper
- Audio responses returned as base64-encoded data URLs for serverless compatibility

**AI Integration Pattern:**
- OpenAI SDK for all AI operations (chat, transcription, speech)
- GPT-5 model for conversational responses (hard requirement - newest model)
- Response limit: 250 max completion tokens for concise, audio-friendly responses
- System prompt injection with comprehensive Introspect knowledge base
- Conversation history (last 5 messages) included for context

**Knowledge Base Architecture:**
- Static knowledge stored in `server/knowledge/introspect-info.ts`
- Injected as system prompt for every chat completion request
- Contains detailed information about malaria diagnostics, YOLOv8 technology, and company details

**Audio Processing Strategy:**
- Base64 encoding for all audio responses (not file streaming)
- Design decision: Ensures compatibility with serverless platforms (Vercel, Render)
- Trade-off: Larger response payloads but universal platform support

### Database & State

**Current Implementation:** In-memory storage only
- User schema defined but not actively used
- No persistent chat history
- Session management configured but minimal usage

**Database Configuration:**
- Drizzle ORM configured for PostgreSQL (via Neon serverless driver)
- Schema defined in `shared/schema.ts`
- Migration support via drizzle-kit
- **Note:** Database is configured but not required for core functionality

**Session Management:**
- Express sessions with PostgreSQL store configured (connect-pg-simple)
- Session secret required in environment variables
- Minimal session usage in current implementation

### Type System & Validation

**Shared Types:**
- TypeScript interfaces in `shared/schema.ts` for type safety across client/server
- Zod schemas for runtime validation of API requests
- Type definitions: ChatMessage, VoiceStatus, API request/response types

**Path Aliases:**
- `@/` → client source directory
- `@shared/` → shared type definitions
- `@assets/` → static assets (avatar images)

## External Dependencies

### Third-Party APIs

**OpenAI Platform** (Required)
- **Services Used:**
  - GPT-5 for chat completions
  - Whisper for speech-to-text transcription
  - TTS (text-to-speech) for voice output generation
- **API Key:** Required via `OPENAI_API_KEY` environment variable
- **Cost Implications:** Pay-per-use based on tokens and audio duration

### Cloud Services & Deployment

**Database (Optional):**
- Neon Serverless PostgreSQL configured but not required
- `DATABASE_URL` environment variable expected if database features are enabled

**Deployment Platforms:**
- **Render:** Recommended (single-instance deployment, full voice support)
- **Replit:** Supported (development and hosting)
- **Vercel:** Partial support (serverless functions, base64 audio approach)

**Environment Variables Required:**
- `OPENAI_API_KEY` - OpenAI API authentication
- `SESSION_SECRET` - Express session encryption
- `DATABASE_URL` - PostgreSQL connection (optional, if database is provisioned)
- `NODE_ENV` - Runtime environment (development/production)

### UI Component Libraries

**Radix UI Primitives:**
- Comprehensive set of 20+ unstyled accessible components
- Dialog, Dropdown, Popover, Toast, and form primitives
- Handles accessibility, keyboard navigation, and focus management

**Styling & Animation:**
- Tailwind CSS with custom configuration
- Framer Motion for avatar state transitions
- Custom CSS variables for theming (light/dark mode support defined)

**Form & Data Handling:**
- React Hook Form with Zod resolvers for validation
- TanStack Query for API mutations and data fetching
- Date-fns for timestamp formatting

### Audio & Media

**Browser APIs:**
- MediaRecorder API for voice recording
- HTML5 Audio element for playback
- Web Audio API (potential future enhancement)

**Supported Formats:**
- Input: WebM audio (browser-recorded)
- Output: MP3 (OpenAI TTS)
- Base64 data URLs for audio transmission

### Build & Development Tools

- **Vite:** Frontend build tool with React plugin
- **esbuild:** Backend bundler for production
- **TypeScript:** Type checking across entire stack
- **Drizzle Kit:** Database migrations (if database is used)
- **Replit Plugins:** Dev banner, cartographer, runtime error overlay (in Replit environment)