# Introspect AI Chatbot

A modern voice-enabled chatbot that answers questions about Introspect's AI-powered malaria diagnostic system. Features a human avatar, voice input/output, and comprehensive knowledge about the company.

## Features

- **Voice Interaction**: Speak your questions and hear responses
- **Human Avatar**: Animated assistant with different states (idle, listening, speaking)
- **AI-Powered**: Uses GPT-5 with comprehensive Introspect knowledge base
- **Real-time Audio**: Speech-to-text (Whisper) and text-to-speech capabilities
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Mobile-Friendly**: Works seamlessly on all devices

## Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- TanStack Query for data fetching
- Shadcn UI components
- Web Speech API for voice recording

### Backend
- Node.js with Express
- OpenAI GPT-5 for chat responses
- OpenAI Whisper for speech-to-text
- OpenAI TTS for text-to-speech
- TypeScript for type safety

## Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file with:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   SESSION_SECRET=your_random_secret_here
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5000`

## Deployment

### ⚠️ IMPORTANT: Audio Storage Limitations

**Current Implementation**: Uses in-memory storage with TTL for voice responses. This is a **prototype/development** implementation that:

**✅ WORKS FOR**:
- Local development (Replit, localhost)
- Render with 1 instance (single-server deployment)

**❌ DOES NOT WORK FOR**:
- Vercel (serverless - each request may hit different instance)
- Render with multiple instances (load-balanced deployments)
- Any serverless platform (AWS Lambda, Cloudflare Workers, etc.)

### Why This Limitation Exists

Voice responses require storing audio files temporarily. Serverless platforms run each request in isolated containers that don't share memory, so the `/api/audio/:id` endpoint can't retrieve audio generated in a different container.

### Production Solutions

To make voice responses work on serverless platforms, you must implement one of these approaches:

**Option 1: Use Persistent Storage** (Recommended for production)
- **Vercel**: Integrate [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- **AWS/Render**: Use S3 or compatible object storage
- **Any platform**: Use Redis for temporary audio storage

**Option 2: Stream Audio Directly** (Recommended for serverless)
- Modify `/api/chat` to return audio as base64 data URL for short responses (<500KB)
- For long responses, consider client-side TTS or streaming solutions

**Option 3: Text-Only Mode**
- Disable voice output on serverless platforms
- Keep text chat functionality (works everywhere)

### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set environment variables in Vercel dashboard:**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SESSION_SECRET`: Random secret for sessions

4. **⚠️ Important**: Modify `server/routes.ts` to use Vercel Blob Storage for audio instead of in-memory Map

### Render Deployment (Recommended for Voice Features)

1. **Connect your repository** to Render

2. **Use the provided `render.yaml`** configuration

3. **Set environment variables** in Render dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SESSION_SECRET` will be auto-generated

4. **Deploy** automatically from your repository

5. **Important**: 
   - Use **1 instance** for voice features to work
   - For multiple instances, implement persistent audio storage (S3, Redis, etc.)

## Environment Variables

- `OPENAI_API_KEY` (required): Your OpenAI API key for GPT-5, Whisper, and TTS
- `SESSION_SECRET` (required): Random string for session encryption
- `NODE_ENV`: Set to `production` for production deployments

## API Endpoints

- `POST /api/chat`: Send a message and get AI response with audio
- `POST /api/transcribe`: Upload audio file for transcription
- `GET /api/audio/:id`: Retrieve generated audio file
- `GET /api/health`: Health check endpoint

## Usage

1. **Click the microphone button** to start voice recording
2. **Speak your question** about Introspect
3. **The AI will respond** both in text and voice
4. **Alternatively, type** your question in the text input

## Example Questions

- "What is Introspect?"
- "How accurate is the AI diagnosis?"
- "How fast are the results?"
- "Can it work offline?"
- "What technology does it use?"
- "What are the benefits to society?"

## Browser Compatibility

- Chrome/Edge: Full support including voice input
- Firefox: Full support including voice input
- Safari: Full support including voice input
- Mobile browsers: Full support with touch-optimized interface

## License

This project is proprietary software for Introspect.

## Support

For questions or support, please contact the Introspect team.
