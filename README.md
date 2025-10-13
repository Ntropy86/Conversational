# 🤖 Conversational AI Portfolio

An intelligent conversational AI system that helps visitors explore a professional portfolio through natural language queries. Features voice interaction, smart resume querying, and a digital guestbook.

**Live Demo**: [https://ntropy.dev](https://ntropy.dev)

[![Deploy](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Backend](https://img.shields.io/badge/Backend-Hugging%20Face-yellow)](https://huggingface.co/spaces)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Database](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-cyan?logo=tailwind-css)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/Groq-LLM-orange)](https://groq.com/)
[![Whisper](https://img.shields.io/badge/OpenAI-Whisper-green)](https://openai.com/whisper/)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-TTS-purple)](https://elevenlabs.io/)
[![ONNX](https://img.shields.io/badge/ONNX-Runtime-blue?logo=onnx)](https://onnxruntime.ai/)
[![Hugging Face](https://img.shields.io/badge/🤗-Hugging%20Face-yellow)](https://huggingface.co/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://vercel.com/)

---

## 📸 Screenshots

### Portfolio Home
![Portfolio Home](./docs/screenshots/Home.png)
*Clean, modern interface with intelligent tab management and responsive design*

### AI Assistant
![AI Assistant](./docs/screenshots/AI.png)
*Interactive AI assistant providing contextual responses about experience and projects*

### Guardrails
![Guardrails](./docs/screenshots/Guardrails.png)
*Used all SOTA guardrailing and finetuning techniques to make sure that the conversation stays focused on the task at hand, i.e, knowing ME!*

### Voice Interface
![Voice Interface](./docs/screenshots/Voice%20AI.png)
*Advanced voice processing with real-time transcription and natural speech synthesis*

---

## 🌟 Features

### 💬 **Smart Query System**
- Natural language understanding for portfolio queries
- Hybrid NLP + LLM architecture for fast, accurate responses
- Context-aware follow-up question handling
- Technology-based filtering and search

### 🎙️ **Voice Interaction**
- Real-time voice-to-text transcription (Whisper)
- Natural text-to-speech responses (ElevenLabs TTS)
- Voice activity detection for seamless conversation
- <500ms local latency for complete voice processing cycles

### 📊 **AI Session Logging**
- All interactions logged to Supabase database
- Session tracking and analytics
- Query history and user insights

### ✍️ **Digital Guestbook**
- Canvas-based signature drawing
- Emoji selection
- Persistent storage in Supabase
- Infinite scroll pagination

---

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │  Next.js + React + Tailwind CSS
│  (Vercel)   │
└──────┬──────┘
       │
       │ HTTPS
       ▼
┌─────────────┐
│   Backend   │  FastAPI + Python
│ (HF Spaces) │
└──────┬──────┘
       │
       ├──────► Groq LLM (Qwen2.5-7B-Instant)
       ├──────► Whisper (Speech-to-Text)
       ├──────► ElevenLabs (Text-to-Speech)
       └──────► Supabase (PostgreSQL Database)
```

### Tech Stack

**Frontend:** Next.js 14, React 18, Tailwind CSS, TypeScript  
**Backend:** FastAPI, Python 3.9+, Groq API, Whisper, ElevenLabs TTS  
**Database:** Supabase (PostgreSQL)  
**Deployment:** Vercel (Frontend), Hugging Face Spaces (Backend)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- Supabase Account (free tier)
- Groq API Key (free tier)
- ElevenLabs API Key

### 1. Clone & Setup Backend

```bash
git clone https://github.com/Ntropy86/conversational.git
cd conversational/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your keys (GROQ_API_KEY, ELEVENLABS_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY)

# Run database schema in Supabase SQL Editor (supabase_schema.sql)

# Start backend
python api_server.py
```

### 2. Setup Frontend

```bash
cd ../frontend
npm install

# Configure environment
cp .env.example .env.local
# Edit NEXT_PUBLIC_API_URL (default: http://localhost:8000)

# Start frontend
npm run dev
```

Visit `http://localhost:3000`

---

## 📦 Project Structure

```
conversational/
├── frontend/           # Next.js app (Vercel)
│   ├── src/hooks/      # useUniversalVAD, voice processing
│   ├── src/context/    # AI agent state management  
│   └── src/components/ # Voice interface components
├── backend/            # FastAPI server (Hugging Face)
│   ├── api_server.py         # REST endpoints + WebSocket
│   ├── llm_service.py        # Groq integration
│   ├── transcribe_service.py # Whisper STT processing
│   ├── tts_service.py        # ElevenLabs TTS synthesis
│   └── resume_query_processor.py # NLP + RAG implementation
├── hf-backend/         # Production deployment
└── docs/               # Documentation
    ├── screenshots/    # Demo images
    └── backend/        # Session fix guide
```

---

## 🗄️ Database Setup

1. Create Supabase project: [supabase.com](https://supabase.com)
2. Run `backend/supabase_schema.sql` in SQL Editor
3. Get credentials from Settings → API
4. Add to `.env`: `SUPABASE_URL` and `SUPABASE_ANON_KEY`

---

## 🚢 Deployment

**Frontend (Vercel):**
```bash
cd frontend
vercel
# Add NEXT_PUBLIC_API_URL in Vercel dashboard
```

**Backend (Hugging Face):**  
See `hf-backend/HUGGINGFACE_DEPLOYMENT.md` for full guide

---

## 📖 Documentation

- **Session Fix Guide**: `docs/backend/SESSION_FIX_SUMMARY.md`
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

Groq • Supabase • Hugging Face • Vercel • OpenAI Whisper • ElevenLabs

---

Created by [Ntropy86](https://github.com/Ntropy86)  
**⭐ Star this repo if you found it helpful!**

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
