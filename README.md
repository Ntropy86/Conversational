# 🤖 Conversational AI Portfolio Assistant# Conversational AI Portfolio



An intelligent conversational AI system that helps visitors explore a professional portfolio through natural language queries. Features voice interaction, smart resume querying, and a digital guestbook.**Live Demo**: [https://ntropy.dev](https://ntropy.dev)



[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)

[![Backend](https://img.shields.io/badge/Backend-Hugging%20Face-yellow)](https://huggingface.co/spaces)[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)

[![Database](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?logo=fastapi)](https://fastapi.tiangolo.com/)

[![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)](https://python.org/)

---[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org/)

[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-cyan?logo=tailwind-css)](https://tailwindcss.com/)

## 🌟 Features

[![Groq](https://img.shields.io/badge/Groq-LLM-orange)](https://groq.com/)

### 💬 **Smart Query System**[![Whisper](https://img.shields.io/badge/OpenAI-Whisper-green)](https://openai.com/whisper/)

- Natural language understanding for portfolio queries[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-TTS-purple)](https://elevenlabs.io/)

- Hybrid NLP + LLM architecture for fast, accurate responses[![ONNX](https://img.shields.io/badge/ONNX-Runtime-blue?logo=onnx)](https://onnxruntime.ai/)

- Context-aware follow-up question handling[![Hugging Face](https://img.shields.io/badge/🤗-Hugging%20Face-yellow)](https://huggingface.co/)

- Technology-based filtering and search[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com/)



### 🎙️ **Voice Interaction**A **_voice-first portfolio website_** with **_real-time speech processing_** and **_intelligent content discovery_**. Built by [Nitigya](https://github.com/Ntropy86) using **_conversational AI_** and **_modern web technologies_**.

- Real-time voice-to-text transcription (Whisper)

- Natural text-to-speech responses (Edge TTS)## Live Demo

- Voice activity detection for seamless conversation

![Portfolio Home](./Home.png)

### 📊 **AI Session Logging***Clean, modern interface with intelligent tab management and responsive design*

- All interactions logged to Supabase database

- Session tracking and analytics![AI Assistant](./AI.png)

- Query history and user insights*Interactive AI assistant providing contextual responses about experience and projects*



### ✍️ **Digital Guestbook**![Guardrails](./Guardrails.png)

- Canvas-based signature drawing*Used all SOTA guardrailing and finetuning techniques to make sure that the conversation stay focused on the task at hand, i.e, knowing ME!*

- Emoji selection

- Persistent storage in Supabase![Voice Interface](./Voice%20AI.png)

*Advanced voice processing with real-time transcription and natural speech synthesis*

---

## Core Features

## 🏗️ Architecture

**_Voice Processing Pipeline_**

```- **_Whisper_** integration for **_real-time speech-to-text_**

┌─────────────┐- **_Voice Activity Detection_** with browser-specific implementations

│   Frontend  │  Next.js + React + Tailwind CSS- **_ElevenLabs TTS_** for **_natural speech synthesis_**

│  (Vercel)   │- **_<500ms local latency_** for complete voice processing cycles

└──────┬──────┘

       │**_AI-Powered Content Discovery_**

       │ HTTPS- **_Groq Qwen2.5-7B-Instant_** model for **_intelligent responses_**

       ▼- **_NLP-based query processing_** with **_intent recognition_**

┌─────────────┐- **_RAG implementation_** for **_contextual portfolio content_**

│   Backend   │  FastAPI + Python- **_Dynamic date parsing_** ("from 23" → "from 2023", "last year")

│ (HF Spaces) │

└──────┬──────┘**_Production Architecture_**

       │- **_Next.js 14_** frontend deployed on **_Vercel_**

       ├──────► Groq LLM (GPT-4 alternative)- **_FastAPI_** backend running on **_Hugging Face Spaces_**

       ├──────► Whisper (Speech-to-Text)- **_ONNX Runtime_** for **_optimized model inference_**

       ├──────► Edge TTS (Text-to-Speech)- **_Cross-browser compatibility_** with **_Safari VAD fallbacks_**

       └──────► Supabase (PostgreSQL Database)

```## Technical Stack



### Tech Stack**_Frontend (Vercel)_**

```

**Frontend:** Next.js 14, React 18, Tailwind CSS, TypeScript  Next.js 14 + React 18 + TypeScript

**Backend:** FastAPI, Python 3.9+, Groq API, Faster Whisper, Edge TTS  ├── Custom VAD hooks with browser detection

**Database:** Supabase (PostgreSQL)  ├── Real-time audio processing with Web Audio API

**Deployment:** Vercel (Frontend), Hugging Face Spaces (Backend)├── Tailwind CSS responsive design

└── Progressive enhancement

---```



## 🚀 Quick Start**_Backend (Hugging Face Spaces)_**

```

### PrerequisitesFastAPI + Python 3.9+

├── Whisper (openai-whisper) for STT

- Node.js 18+├── Groq API (Qwen2.5-7B-Instant model)

- Python 3.9+├── ElevenLabs API for TTS

- Supabase Account (free tier)├── ONNX Runtime for model optimization

- Groq API Key (free tier)└── Resume query processor with NLP

```

### 1. Clone & Setup Backend

**_Performance Metrics (Local)_**

```bash- **_Voice processing latency_**: **<500ms** end-to-end

git clone https://github.com/Ntropy86/conversational.git- **_Speech recognition_**: **~200ms** transcription time

cd conversational/backend- **_LLM inference_**: **~150ms** with Groq

- **_TTS generation_**: **~300ms** audio synthesis

# Create virtual environment- **_Concurrent sessions_**: **50+ simultaneous users**

python -m venv venv

source venv/bin/activate  # Windows: venv\Scripts\activate## Setup



# Install dependencies**_Prerequisites_**

pip install -r requirements.txt- **Node.js 18+**, **Python 3.9+**

- **Modern browser** with **_WebRTC support_**

# Configure environment

cp .env.example .env**_Local Development_**

# Edit .env with your keys (GROQ_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY)```bash

git clone https://github.com/Ntropy86/Conversational.git

# Run database schema in Supabase SQL Editor (supabase_schema.sql)cd Conversational



# Start backend# Frontend

python api_server.pycd frontend && npm install && npm run dev

```

# Backend  

### 2. Setup Frontendcd backend && pip install -r requirements.txt && python api_server.py

```

```bash

cd ../frontend**_Environment Variables_**

npm install```bash

# backend/.env

# Configure environmentGROQ_API_KEY=your_groq_key_here

cp .env.example .env.localELEVENLABS_API_KEY=your_elevenlabs_key_here

# Edit NEXT_PUBLIC_API_URL=http://localhost:8000```



# Start frontend**_Access_**: `localhost:3000` (frontend) + `localhost:8000` (backend)

npm run dev

```## Architecture



Visit `http://localhost:3000````

├── frontend/                   # Next.js 14 + TypeScript

---│   ├── src/hooks/             # useUniversalVAD, voice processing

│   ├── src/context/           # AI agent state management  

## 📦 Project Structure│   └── src/components/        # Voice interface components

├── backend/                   # FastAPI + Python

```│   ├── api_server.py         # REST endpoints + WebSocket

conversational/│   ├── llm_service.py        # Groq Qwen2.5-7B integration

├── frontend/           # Next.js app (Vercel)│   ├── transcribe_service.py # Whisper STT processing

├── backend/            # FastAPI server (Hugging Face)│   ├── tts_service.py        # ElevenLabs TTS synthesis

├── hf-backend/        # Hugging Face deployment (git-ignored)│   └── resume_query_processor.py # NLP + RAG implementation

└── docs/              # Documentation└── hf-backend/               # Production deployment

    ├── backend/       # Backend docs & session fix guide```

    └── archive/       # Old documentation

```## Technical Implementation



---**_Voice Processing_**

- **_Browser-specific VAD_** with **_Safari fallback implementations_**

## 🗄️ Database Setup- **_Whisper model_** integration for **_real-time transcription_**

- **_ONNX Runtime_** optimization for **_faster inference_**

1. Create Supabase project: [supabase.com](https://supabase.com)- **_Unified voice/text pipeline_** ensuring **_feature parity_**

2. Run `backend/supabase_schema.sql` in SQL Editor

3. Get credentials from Settings → API**_NLP & RAG_**

4. Add to `.env`: `SUPABASE_URL` and `SUPABASE_ANON_KEY`- **_Custom query processor_** with **_intent recognition_**

- **_Semantic similarity matching_** for **_content discovery_**

---- **_Dynamic date parsing_** with **_natural language support_**

- **_Context-aware responses_** using **_conversation history_**

## 🚢 Deployment

**_Production Features_**

**Frontend (Vercel):**- **_Rate limiting_** and **_session management_**

```bash- **_Graceful dependency handling_** for **_missing libraries_**

cd frontend- **_Cross-browser compatibility_** with **_progressive enhancement_**

vercel- **_Real-time error handling_** and **_user feedback_**

# Add NEXT_PUBLIC_API_URL in Vercel dashboard

```## Author



**Backend (Hugging Face):**  **Built by [Nitigya](https://github.com/Ntropy86)**

See `hf-backend/HUGGINGFACE_DEPLOYMENT.md` for full guide

**_Technology Stack_**

---- **_Groq_** (Qwen2.5-7B-Instant model)

- **_OpenAI Whisper_** (speech recognition)

## 📖 Documentation- **_ElevenLabs_** (text-to-speech synthesis)

- **_ONNX Runtime_** (model optimization)

- **Session Fix Guide**: `docs/backend/SESSION_FIX_SUMMARY.md`- **_Hugging Face Spaces_** (backend deployment)

- **API Docs**: `http://localhost:8000/docs` (when running)
- **HF Deployment**: `hf-backend/HUGGINGFACE_DEPLOYMENT.md`

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push (`git push origin feature/name`)
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

Groq • Supabase • Hugging Face • Vercel • OpenAI Whisper • Edge TTS

---

Created by [Ntropy86](https://github.com/Ntropy86)  
**⭐ Star this repo if you found it helpful!**
