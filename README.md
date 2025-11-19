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

### Universal Platform Support

The chatbot uses **base64-encoded audio delivery** which works across **all platforms**:

✅ **Vercel** (serverless)
✅ **Render** (single or multiple instances)  
✅ **Replit**
✅ **AWS Lambda, Cloudflare Workers, etc.**
✅ **Localhost**

**How it works**:
- AI responses are kept concise (optimized for voice UX)
- TTS audio is embedded as base64 data URL in the API response
- No external storage required
- Works in serverless, multi-instance, and traditional deployments

**Performance**: Audio responses are typically 50-150KB (embedded in ~200KB JSON response), which is well within platform limits and provides instant playback.

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

4. **Deploy:**
   ```bash
   vercel --prod
   ```

That's it! Voice features work out of the box on Vercel.

### Render Deployment

1. **Connect your repository** to Render

2. **Use the provided `render.yaml`** configuration

3. **Set environment variables** in Render dashboard:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SESSION_SECRET` will be auto-generated

4. **Deploy** automatically from your repository

Voice features work perfectly on Render!

## Environment Variables

- `OPENAI_API_KEY` (required): Your OpenAI API key for GPT-5, Whisper, and TTS
- `SESSION_SECRET` (required): Random string for session encryption
- `NODE_ENV`: Set to `production` for production deployments

## API Endpoints

- `POST /api/chat`: Send a message and get AI response with embedded audio (base64 data URL)
- `POST /api/transcribe`: Upload audio file for transcription
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
