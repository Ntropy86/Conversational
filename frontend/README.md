# Frontend - Voice-First Portfolio Interface

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css)

**_Voice-enabled conversational interface_** built with **_Next.js 14_** and **_React 18_**. Features **_real-time voice processing_**, **_browser-compatible VAD_**, and **_responsive design_** for both desktop and mobile interactions.

## Features

**_Voice Interface_**
- **_Real-time voice recording_** with **_browser microphone API_**
- **_Voice Activity Detection_** with **_adaptive silence thresholds_**
- **_Audio visualization_** with **_live waveform display_**
- **_Cross-browser compatibility_** (Chrome, Firefox, Safari)

**_Modern UI/UX_**
- **_Responsive design_** with **_mobile-first approach_**
- **_Dark/light mode_** with **_system preference detection_**
- **_Smooth animations_** using **_Framer Motion_**
- **_Accessibility features_** with **_ARIA compliance_**

**_Smart Interactions_**
- **_Conversation history_** with **_persistent sessions_**
- **_Dynamic content cards_** for **_structured responses_**
- **_Real-time status indicators_** (listening, processing, speaking)
- **_Error handling_** with **_graceful fallbacks_**

## Architecture

**_Component Structure_**
```typescript
src/
├── app/                    // Next.js 14 App Router
│   ├── globals.css        // Global styles + Tailwind
│   ├── layout.tsx         // Root layout with providers
│   └── page.tsx           // Main conversation interface
├── components/            // Reusable UI components
│   ├── ConversationInterface.tsx  // Main voice interface
│   ├── AudioRecorder.tsx         // Voice recording logic
│   ├── MessageDisplay.tsx        // Chat message rendering
│   └── StatusIndicator.tsx       // Processing states
├── hooks/                 // Custom React hooks
│   ├── useVoiceRecording.ts      // Voice recording logic
│   ├── useConversation.ts        // Chat state management
│   └── useAudioVisualization.ts  // Waveform rendering
├── services/              // API integration
│   ├── apiClient.ts              // Backend communication
│   ├── audioService.ts           // Audio processing
│   └── vadService.ts             // Voice Activity Detection
└── utils/                 // Helper functions
    ├── audioUtils.ts             // Audio manipulation
    └── constants.ts              // App configuration
```

**_Voice Processing Pipeline_**
```typescript
[Microphone] → [MediaRecorder] → [VAD Analysis] → [Backend API] → [Response Display]
      ↓              ↓               ↓                ↓              ↓
  [Permission]   [Blob Creation]  [Silence        [POST /process] [Message
   Request]                       Detection]                       Rendering]
```

## Quick Start

**_Prerequisites_**
- **Node.js 18+**
- **npm/yarn/pnpm**

**_Development Setup_**
```bash
cd frontend
npm install
npm run dev
```

**_Production Build_**
```bash
npm run build
npm start
```

**_Environment Configuration_**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
```

## Component Details

**_Voice Recording (`AudioRecorder.tsx`)_**
- **_MediaRecorder API_** integration
- **_Cross-browser compatibility_** handling
- **_Audio format optimization_** (webm/mp4)
- **_Real-time VAD_** processing

**_Conversation Interface (`ConversationInterface.tsx`)_**
- **_Message state management_** with **_React Context_**
- **_Auto-scroll behavior_** for **_chat history_**
- **_Loading states_** and **_error boundaries_**
- **_Responsive layout_** adaptation

**_Audio Visualization_**
- **_Canvas-based waveform_** rendering
- **_Real-time frequency analysis_**
- **_Customizable themes_** and **_colors_**
- **_Performance optimized_** for **_60fps_**

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Voice Recording | ✅ | ✅ | ✅ | ✅ |
| Audio Playback | ✅ | ✅ | ✅ | ✅ |
| VAD Processing | ✅ | ✅ | ⚠️* | ✅ |
| File Upload | ✅ | ✅ | ✅ | ✅ |

_*Safari requires user gesture for microphone access_

## Deployment

**_Vercel (Recommended)_**
```bash
vercel --prod
```

**_Manual Deployment_**
```bash
npm run build
npm run export  # For static hosting
```

**_Environment Variables_**
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

## Performance

- **_Initial Load_**: **_<2s_** (optimized bundle)
- **_Voice Recording_**: **_<100ms_** latency
- **_UI Responsiveness_**: **_60fps_** animations
- **_Bundle Size_**: **_<500KB_** gzipped

Built with **_Next.js 14_** App Router, **_TypeScript_** for type safety, and **_Tailwind CSS_** for responsive design.
