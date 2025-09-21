---
title: Conversational AI Backend
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# Conversational AI Backend API

This is the backend API for a conversational AI assistant that processes voice input and provides intelligent responses.

## Features

- 🎙️ **Audio Transcription** - Convert speech to text using Whisper
- 🧠 **LLM Processing** - Generate intelligent responses using Groq
- 🔊 **Text-to-Speech** - Convert responses back to natural speech
- 💬 **Conversation Management** - Maintain context across interactions
- 📊 **Smart Content Retrieval** - Query resume/portfolio information

## API Endpoints

- `POST /process` - Full audio processing pipeline
- `POST /test/transcribe` - Test audio transcription
- `POST /test/llm` - Test LLM responses  
- `POST /test/tts` - Test text-to-speech
- `POST /smart/query` - Smart query with rate limiting
- `POST /session/create` - Create conversation session

## Environment Variables

Set your `GROQ_API_KEY` in the Hugging Face Spaces settings.

## Usage

This API is designed to work with a React frontend that records audio and sends it for processing. The backend returns transcriptions, intelligent responses, and audio files.

Built with FastAPI, Whisper, and Groq LLM.