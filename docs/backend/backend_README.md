# Conversational Resume AI Backend

## Setup
```bash
export GROQ_API_KEY=your_key_here
pip install -r requirements.txt  # Install all dependencies
```

## Architecture Overview

This backend implements an **Agentic Resume AI** system that can intelligently query and present structured resume data as interactive cards, matching the static website's design.

### Key Components

1. **Resume Query Processor** (`resume_query_processor.py`)
   - Intelligent intent extraction (projects, experience, skills, education, publications)
   - Technology/keyword filtering using semantic mappings
   - Returns structured data with metadata for frontend rendering

2. **Enhanced LLM Service** (`llm_service.py`)
   - Groq API integration with Qwen-7B model
   - Structured response generation with card data
   - Context-aware responses using resume data

3. **API Server** (`api_server.py`)
   - FastAPI with CORS enabled
   - Structured endpoints returning card-ready data
   - Session management for conversation continuity

4. **AI Services Pipeline**
   - **VAD**: Silero VAD for voice activity detection
   - **Transcription**: Faster Whisper for speech-to-text
   - **LLM**: Groq/Qwen for intelligent responses
   - **TTS**: Edge TTS for text-to-speech

## API Endpoints

### Core Endpoints

- `GET /` - Health check
- `POST /session/create` - Create conversation session
- `POST /test/llm` - **Structured LLM responses** with card data
- `POST /process` - Full audio pipeline (VAD → Whisper → LLM → TTS)

### Structured Response Format
```json
{
  "response": "AI response text",
  "items": [
    {
      "id": "project-id",
      "title": "Project Title",
      "date": "2024",
      "description": "Project description",
      "technologies": ["Python", "FastAPI"],
      "keywords": ["ai", "backend"],
      "link": "https://github.com/...",
      "metrics": "2k+ users"
    }
  ],
  "item_type": "projects",
  "metadata": {
    "tech_filters": ["python"],
    "total_results": 4
  }
}
```

## Testing the System

### 1. Start the Backend Server
```bash
python api_server.py
# Server runs on http://localhost:8000
```

### 2. Test Structured Queries
```bash
# Test projects query
curl -X POST http://localhost:8000/test/llm \
  -H "Content-Type: application/json" \
  -d '{"text": "What projects has he worked on?"}'

# Test experience with technology filter
curl -X POST http://localhost:8000/test/llm \
  -H "Content-Type: application/json" \
  -d '{"text": "Tell me about his AWS experience"}'

# Test skills query
curl -X POST http://localhost:8000/test/llm \
  -H "Content-Type: application/json" \
  -d '{"text": "What are his Python skills?"}'
```

### 3. Test Individual Components

```bash
# Test Resume Query Processor
python resume_query_processor.py

# Test individual services
python vad_service.py      # Voice Activity Detection
python transcribe_service.py  # Speech-to-Text
python llm_service.py      # LLM responses
python tts_service.py      # Text-to-Speech
```

## Resume Data Structure

The system uses `resume_data.json` with enhanced metadata:

- **Projects**: With technologies, keywords, metrics, GitHub links
- **Experience**: With highlights, technologies, company info
- **Skills**: Categorized by domain (languages, backend, ML, etc.)
- **Education**: Academic background with coursework
- **Publications**: Research papers with DOIs/links

## Query Intelligence

The system can understand and respond to:

- **Intent Recognition**: "projects", "experience", "skills", etc.
- **Technology Filtering**: "Python projects", "AWS experience"
- **Semantic Matching**: Maps related terms (AI → machine learning, etc.)
- **Contextual Responses**: Witty, accurate responses using structured data

## Frontend Integration

Responses are designed to render as interactive cards matching the static website:
- Same Card component styling
- Clickable navigation to detailed views
- Technology chips with consistent design
- Smooth transitions between AI and static modes

## Recent Updates (September 2025)

✅ **Agentic Architecture**: Intelligent query processing with structured responses
✅ **Enhanced LLM**: Context-aware responses with resume data integration
✅ **Card Rendering**: Frontend integration for interactive resume cards
✅ **Smart Filtering**: Technology-based filtering and semantic matching
✅ **Seamless Navigation**: Click cards to navigate to static website sections

The system now provides a truly conversational resume experience with the same visual fidelity as the static website.