# Deployment Guide - Introspect AI Chatbot

## Quick Start

**Best for beginners**: Deploy to Render with 1 instance - voice features work out of the box!

## Deployment Options Comparison

| Platform | Text Chat | Voice Input | Voice Output | Complexity | Cost |
|----------|-----------|-------------|--------------|------------|------|
| **Render (1 instance)** | ✅ | ✅ | ✅ | Low | Free tier available |
| **Replit** | ✅ | ✅ | ✅ | Lowest | Free tier available |
| **Vercel** | ✅ | ✅ | ❌* | Medium | Free tier available |
| **Render (multi-instance)** | ✅ | ✅ | ❌* | High | Paid |

*Requires modification - see below

## Recommended: Render Single-Instance Deployment

This is the easiest way to get all features working, including voice responses.

### Step-by-Step Instructions

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo>
   git push -u origin main
   ```

2. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

3. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will detect the `render.yaml` configuration

4. **Configure Environment Variables**
   - Render will automatically create `SESSION_SECRET`
   - Add your `OPENAI_API_KEY`:
     - Go to https://platform.openai.com/api-keys
     - Create a new secret key
     - Paste it in Render's environment variables

5. **Deploy**
   - Click "Create Web Service"
   - Wait for the build to complete (2-5 minutes)
   - Your chatbot will be live at `https://your-app.onrender.com`

6. **Verify Voice Features**
   - Open the deployed URL
   - Click the microphone button
   - Speak a question
   - You should hear the AI respond with voice!

## Alternative: Vercel Deployment (Text + Voice Input Only)

Vercel's serverless architecture doesn't support the current voice output implementation. You have two options:

### Option A: Deploy without Voice Output

The chatbot will work but won't speak responses (text-only output).

1. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set Environment Variables in Vercel Dashboard**
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SESSION_SECRET`: Any random string

### Option B: Modify for Vercel Blob Storage (Advanced)

To enable voice output on Vercel, you must modify `server/routes.ts`:

1. **Install Vercel Blob**
   ```bash
   npm install @vercel/blob
   ```

2. **Modify `server/routes.ts`**

   Replace the audio storage section with:
   ```typescript
   import { put } from '@vercel/blob';

   // In the /api/chat endpoint, replace storeAudio with:
   const audioBuffer = await generateSpeech(responseText);
   const blob = await put(`audio/${randomUUID()}.mp3`, audioBuffer, {
     access: 'public',
     addRandomSuffix: false,
   });
   audioUrl = blob.url;
   ```

3. **Remove the `/api/audio/:id` endpoint** (no longer needed)

4. **Deploy**
   ```bash
   vercel --prod
   ```

## Troubleshooting

### Voice responses not working

**On Render**:
- Ensure you're using exactly 1 instance (not 0, not 2+)
- Check logs for TTS errors
- Verify OPENAI_API_KEY is set correctly

**On Vercel**:
- Voice output requires Vercel Blob Storage modification (see above)
- Voice input (speech-to-text) should work fine

### "Audio not found or expired" errors

This means the audio was generated on a different server instance:
- On Render: Check instance count (should be 1)
- On Vercel: Implement Vercel Blob Storage
- Solution: Deploy to Render with 1 instance

### High latency on first request

This is normal on free tiers:
- Render free tier: Server sleeps after inactivity, ~30s cold start
- Vercel free tier: Function cold starts, ~5-10s delay
- Solution: Upgrade to paid tier or keep app warm with uptime monitoring

## Scaling for Production

When you're ready to scale beyond a single instance:

1. **Implement Persistent Audio Storage**
   - AWS S3 + CloudFront
   - Vercel Blob Storage
   - Redis with TTL

2. **Update `server/routes.ts`**
   - Replace the `audioStore` Map with your chosen storage
   - Update `/api/audio/:id` to fetch from storage

3. **Deploy to Multi-Instance**
   - Render: Increase instance count
   - Vercel: No changes needed (auto-scales)

## Support

For issues specific to:
- **Introspect chatbot**: Check GitHub issues
- **Vercel deployment**: [Vercel Docs](https://vercel.com/docs)
- **Render deployment**: [Render Docs](https://render.com/docs)
- **OpenAI API**: [OpenAI Platform](https://platform.openai.com/docs)
