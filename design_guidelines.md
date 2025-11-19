# Introspect Voice Chatbot - Design Guidelines

## Design Approach

**Hybrid Approach**: Drawing inspiration from ChatGPT's clean conversational UI combined with modern AI assistant interfaces (Replika, Character.AI) that feature avatar-based interactions. The design prioritizes functional clarity while adding warmth through the human avatar to make technical medical information more approachable.

**Core Principles**:
- Conversation-first: Chat interface dominates the layout
- Human connection: Avatar brings personality to AI interactions
- Medical professionalism: Clean, trustworthy aesthetic suitable for healthcare
- Voice-optimized: Clear visual feedback for audio interactions

---

## Layout System

**Spacing Units**: Use Tailwind units of 2, 4, 6, and 8 consistently (p-4, gap-6, my-8)

**Main Layout Structure**:
- Full viewport height (h-screen) split layout
- Left sidebar (desktop): 320px width for branding and info
- Main chat area: Flexible width with max-w-4xl centered content
- Mobile: Stacked single column, collapsible sidebar

**Chat Container**:
- Messages area: Scrollable with overflow-y-auto, fills remaining space
- Input area: Fixed bottom position, elevated with shadow
- Avatar: Fixed position in top-right of chat area on desktop, top-center on mobile

---

## Typography

**Font Families**:
- Primary: Inter (body, UI elements, chat messages)
- Accent: Space Grotesk (headings, branding)

**Hierarchy**:
- Page Title/Brand: text-2xl font-bold (Space Grotesk)
- Section Headers: text-lg font-semibold (Inter)
- Chat Messages: text-base font-normal (Inter)
- Timestamps: text-xs font-medium opacity-70 (Inter)
- Button Text: text-sm font-medium (Inter)

---

## Component Library

### Chat Message Bubbles
- User messages: Right-aligned, rounded-2xl, max-w-md
- Bot messages: Left-aligned, rounded-2xl, max-w-xl
- Padding: px-4 py-3
- Shadow: subtle shadow-sm
- Gap between messages: space-y-4

### Human Avatar Component
- Circular container: w-32 h-32 on desktop, w-24 h-24 on mobile
- Border: border-4 with subtle glow effect
- Shadow: shadow-xl with soft spread
- Position: Fixed or sticky top-right
- Animation states: Idle (subtle breathing), Listening (pulsing), Speaking (lip-sync motion)

### Voice Controls
- Primary mic button: Large circular button (w-16 h-16), centered
- States: Inactive (solid), Listening (pulsing ring animation), Processing (spinner)
- Stop button: Secondary circular button (w-12 h-12)
- Visual feedback: Waveform visualization during voice input (animated bars, h-2 each)

### Input Area
- Container: Fixed bottom, full width with backdrop blur
- Inner content: max-w-4xl centered with px-6 py-4
- Mic button + Text input (fallback) in flex row
- Send button: Icon only, appears when text present

### Status Indicators
- Voice status badge: Small pill shape showing "Listening...", "Processing...", "Speaking..."
- Position: Above input area or near avatar
- Padding: px-3 py-1, text-xs
- Animated: Fade in/out transitions

### Information Sidebar (Desktop)
- Introspect logo at top: h-12 object-contain
- Company tagline: text-sm beneath logo
- Quick info cards: Compact cards with icon + brief text
- Navigation links: Minimal link list to company sections
- Padding: p-6

### Chat History Header
- Shows conversation summary or patient context if relevant
- Minimal height: py-3
- Border bottom separator

---

## Animations

Use sparingly and purposefully:

**Avatar Animations**:
- Idle: Subtle scale breathing effect (1s duration, ease-in-out)
- Listening: Pulsing glow (0.8s duration, repeating)
- Speaking: Lip-sync simulation (triggered by audio output)

**Voice Feedback**:
- Waveform bars: Animated height based on audio input level
- Mic button pulse: During active listening

**Message Appearance**:
- Fade-in + slight slide-up (0.3s duration) when new message appears

**Loading States**:
- Typing indicator: Three dots with sequential opacity animation

---

## Interaction Patterns

**Voice Flow**:
1. User clicks/taps mic button → Button pulses, waveform appears
2. User speaks → Waveform responds to voice levels
3. User finishes → Auto-detect or manual stop
4. Processing → Avatar shows "thinking" state, status shows "Processing..."
5. Response → Avatar "speaks" with lip animation, text appears in chat
6. Audio plays → Synchronized with text display

**Chat Flow**:
- Auto-scroll to latest message
- Timestamps show on hover or for older messages
- Clear visual separation between user/bot messages

**Fallback Text Input**:
- Always available alongside voice
- Keyboard shortcut: Enter to send
- Shift+Enter for new line

---

## Responsive Behavior

**Desktop (≥1024px)**:
- Sidebar visible (w-80)
- Avatar top-right corner
- Chat messages max 65% width
- Voice controls centered in input area

**Tablet (768px-1023px)**:
- Sidebar collapses to hamburger menu
- Avatar moves to top-center, smaller size
- Chat messages max 80% width

**Mobile (<768px)**:
- Full-width layout
- Avatar compact size, top-center
- Chat messages max 90% width
- Larger touch targets for voice button (w-20 h-20)

---

## Images

**Avatar Image**: 
- Professional human face (photorealistic or stylized illustration)
- Friendly, approachable expression
- Healthcare professional appearance (optional white coat/medical context)
- Located: Fixed position in chat interface, always visible

**Introspect Logo**:
- Company branding in sidebar
- Height: h-10 to h-12
- Placement: Top of sidebar

**Background** (Optional):
- Subtle gradient or abstract medical/tech pattern
- Very low opacity to not distract from chat
- Only in sidebar or behind chat area

No large hero section needed - this is a functional chat interface where the conversation is the primary content.