# Portfolio AI Mode — Resume Q&A + Hybrid Search (Voice & Text)

**Duration**: 2024–2025  
**Link**: [https://ntropy.dev](https://ntropy.dev)

## Overview

A conversational AI system that answers questions about my background using a sophisticated hybrid reasoning engine with dynamic card selection. The system combines voice and text interfaces to provide contextual, grounded responses about my experience, projects, and skills.

## Architecture & Tech Stack

### Backend Infrastructure
- **FastAPI** - Async API server with high-performance endpoints
- **Python** - Core async/await patterns for concurrent processing
- **OpenAI/Qwen-7B** - LLM integration for complex reasoning
- **Whisper** - Real-time speech-to-text transcription
- **TTS (Text-to-Speech)** - Audio response generation
- **WebSockets** - Real-time streaming communication
- **JSON** - Structured resume data storage and retrieval

### Frontend Experience
- **React/Next.js** - Modern UI framework with SSR capabilities
- **WebSocket Client** - Real-time bidirectional communication
- **Web Audio API** - Voice recording and audio playbook
- **Markdown Rendering** - Dynamic tabbed content display

## Hybrid Search System

### Data Foundation
- **Structured Resume Data**: 295 lines of JSON with rich metadata
- **Content Sections**: Experience, Projects, Publications, Blog, Education
- **Rich Metadata**: Keywords, technologies, performance metrics

### Query Processing Pipeline

**Step 1: Intent Detection**
- Classifies queries into categories (experience, projects, skills, etc.)
- Handles both simple factual questions and complex reasoning

**Step 2: Keyword Extraction & Matching**
- Searches through structured data for relevant content
- Technology stack matching and keyword overlap scoring

**Step 3: Content Scoring & Selection**
- Context relevance evaluation with diversity enforcement
- Prevents repetitive card selection through intelligent rotation

## Operating Modes

### Query Processor Only (Fast Path)
**Triggers**: Simple factual queries like "What experience do you have with FastAPI?"

**Behavior**: 
- Direct keyword extraction → JSON matching → return relevant cards
- Sub-100ms response time for immediate user feedback
- No LLM involvement for efficiency

### Enhanced Mode (LLM + Hybrid)
**Triggers**: Complex reasoning questions, follow-ups, comparative queries

**Behavior**:
- LLM consumes full JSON context + conversation history
- Generates rich, conversational responses with examples
- Dynamic card selection based on reasoning context

## Example Interaction

**Query**: "FastAPI experience"  
**Matches**: People & Robots Lab backend work, Current portfolio system  
**Cards**: Shows specific experiences with performance metrics and technical details

## Key Achievements

- **Sub-500ms latency** for streaming responses
- **Context-grounded answers** that prevent hallucination
- **Dynamic card diversity** eliminates repetitive content
- **Voice + Text interface** for flexible interaction modes
- **Production deployment** handling real user queries

## Technical Keywords

`hybrid search`, `intent detection`, `embedding retrieval`, `reranking`, `streaming responses`, `voice UI`, `LLM grounding`, `card diversity`, `session memory`, `speech pipeline`