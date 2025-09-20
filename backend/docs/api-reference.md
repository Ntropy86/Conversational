# API Reference

This document provides comprehensive API documentation for the Conversational AI Backend.

## Base URL

```
Development: http://localhost:8000
Production: https://your-domain.com/api
```

## Authentication

The API uses API key authentication for LLM services. Client-facing endpoints are currently open for development but should implement authentication in production.

```http
# For internal LLM calls
Authorization: Bearer <GROQ_API_KEY>
```

## Global Headers

```http
Content-Type: application/json
Accept: application/json
User-Agent: ConversationalAI/1.0
```

## Endpoints

### Health and Status

#### GET /
Returns API health status and system information.

**Response:**
```json
{
  "status": "healthy",
  "service": "Conversational AI Backend",
  "version": "1.0.0",
  "timestamp": "2024-12-09T10:30:00Z",
  "system_info": {
    "python_version": "3.9.7",
    "models_loaded": {
      "whisper": "base",
      "vad": "silero_vad",
      "tts": "edge-tts"
    },
    "audio_cleanup": "active"
  }
}
```

#### GET /health
Detailed health check with component status.

**Response:**
```json
{
  "status": "healthy",
  "components": {
    "whisper": {
      "status": "ready",
      "model_size": "base",
      "last_used": "2024-12-09T10:25:00Z"
    },
    "groq_llm": {
      "status": "connected",
      "last_request": "2024-12-09T10:28:00Z",
      "rate_limit_remaining": 95
    },
    "edge_tts": {
      "status": "ready",
      "available_voices": 150
    },
    "audio_cleanup": {
      "status": "running",
      "files_managed": 15,
      "last_cleanup": "2024-12-09T10:15:00Z"
    }
  },
  "performance": {
    "memory_usage_mb": 245.6,
    "cpu_usage_percent": 12.3,
    "disk_usage_mb": 1024.0
  }
}
```

### Session Management

#### POST /session/create
Creates a new conversation session.

**Request Body:**
```json
{
  "session_id": "optional-custom-session-id",
  "metadata": {
    "user_agent": "ConversationalAI-Frontend/1.0",
    "platform": "web",
    "language_preference": "en-US"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "session_id": "uuid-v4-session-id",
  "expires_at": "2024-12-09T11:30:00Z",
  "capabilities": {
    "voice_processing": true,
    "content_cards": true,
    "conversation_history": true
  }
}
```

#### GET /session/{session_id}
Retrieves session information and conversation history.

**Response:**
```json
{
  "session_id": "uuid-session-id",
  "created_at": "2024-12-09T10:00:00Z",
  "last_activity": "2024-12-09T10:28:00Z",
  "message_count": 5,
  "conversation_history": [
    {
      "timestamp": "2024-12-09T10:25:00Z",
      "user_input": "Tell me about your projects",
      "ai_response": "Check out these cool projects I built!",
      "items_shown": ["project1", "project2", "project3"],
      "item_type": "projects"
    }
  ]
}
```

#### DELETE /session/{session_id}
Ends a session and cleans up associated resources.

**Response:**
```json
{
  "status": "success",
  "message": "Session ended successfully",
  "cleanup_info": {
    "audio_files_removed": 3,
    "history_archived": true
  }
}
```

### Audio Processing

#### POST /process
Main endpoint for audio processing pipeline.

**Request:**
```http
POST /process
Content-Type: multipart/form-data

audio_file: <binary-audio-data>
session_id: <session-uuid>
```

**Supported Audio Formats:**
- WAV (recommended)
- MP3
- OGG
- M4A
- FLAC

**File Constraints:**
- Maximum file size: 25MB
- Maximum duration: 30 seconds
- Sample rate: 8kHz - 48kHz (automatically converted to 16kHz)

**Response (Success):**
```json
{
  "status": "success",
  "session_id": "uuid-session-id",
  "transcription": "Tell me about your machine learning projects",
  "response": "Check out these awesome ML projects I built!",
  "items": [
    {
      "id": "ml-crime-forecasting",
      "title": "Chicago Crime Forecasting",
      "type": "project",
      "content": "Machine learning model for predicting crime patterns",
      "technologies": ["Python", "TensorFlow", "Pandas"],
      "metrics": "89% accuracy improvement",
      "link": "https://github.com/user/crime-forecasting"
    },
    {
      "id": "eeg-classifier",
      "title": "Moody EEG Classifier", 
      "type": "project",
      "content": "Deep learning for emotion classification from EEG signals",
      "technologies": ["PyTorch", "Signal Processing", "CNN"],
      "metrics": "92% classification accuracy"
    }
  ],
  "item_type": "projects",
  "metadata": {
    "intelligent_selection": true,
    "cards_shown": true,
    "query_intent": "projects",
    "content_filter": "machine_learning",
    "confidence_score": 0.95
  },
  "audio_file": "response_uuid.wav",
  "timing": {
    "vad_ms": 45.2,
    "transcribe_ms": 487.1,
    "llm_ms": 1234.5,
    "tts_ms": 378.9,
    "total_ms": 2145.7
  }
}
```

**Response (Error):**
```json
{
  "status": "error",
  "message": "Transcription failed: Audio file too short",
  "error_code": "AUDIO_TOO_SHORT",
  "debug_info": {
    "component": "whisper_transcription",
    "file_duration": 0.3,
    "minimum_duration": 0.5,
    "suggested_action": "Record longer audio clip"
  },
  "retry_after": null
}
```

#### POST /process/text
Text-only processing for development and testing.

**Request Body:**
```json
{
  "text": "What programming languages do you know?",
  "session_id": "uuid-session-id"
}
```

**Response:**
```json
{
  "status": "success",
  "session_id": "uuid-session-id",
  "input_text": "What programming languages do you know?",
  "response": "I work with Python, JavaScript, Java, and C++!",
  "items": [
    {
      "id": "python",
      "title": "Python",
      "type": "skill",
      "content": "Advanced proficiency in Python development",
      "categories": ["Backend", "Data Science", "Machine Learning"],
      "experience_years": 5,
      "projects_count": 12
    }
  ],
  "item_type": "skills",
  "metadata": {
    "intelligent_selection": true,
    "cards_shown": true,
    "query_intent": "skills",
    "confidence_score": 0.98
  },
  "audio_file": "response_uuid.wav"
}
```

### Text-to-Speech

#### POST /tts
Converts text to speech using Edge TTS.

**Request Body:**
```json
{
  "text": "Hello! This is a test of the text-to-speech system.",
  "voice": "en-US-AriaNeural",
  "rate": "medium",
  "pitch": "medium",
  "output_format": "wav"
}
```

**Available Voices:**
- `en-US-AriaNeural` (default, female)
- `en-US-JennyNeural` (female, conversational)
- `en-US-GuyNeural` (male, professional)
- `en-US-AndrewNeural` (male, warm)
- `en-US-EmmaNeural` (female, young adult)

**Rate Options:** `x-slow`, `slow`, `medium`, `fast`, `x-fast`
**Pitch Options:** `x-low`, `low`, `medium`, `high`, `x-high`

**Response:**
```json
{
  "status": "success",
  "audio_file": "tts_uuid.wav",
  "text_length": 58,
  "audio_duration": 3.2,
  "voice_used": "en-US-AriaNeural",
  "file_size_bytes": 51200,
  "expires_at": "2024-12-09T11:00:00Z"
}
```

#### GET /tts/voices
Lists available TTS voices.

**Response:**
```json
{
  "voices": [
    {
      "name": "en-US-AriaNeural",
      "display_name": "Aria (US English)",
      "gender": "Female",
      "locale": "en-US",
      "style_list": ["cheerful", "empathetic", "newscast"]
    },
    {
      "name": "en-US-GuyNeural", 
      "display_name": "Guy (US English)",
      "gender": "Male",
      "locale": "en-US",
      "style_list": ["newscast", "friendly"]
    }
  ],
  "total_voices": 150,
  "supported_locales": ["en-US", "en-GB", "es-ES", "fr-FR", "de-DE"]
}
```

### Audio File Management

#### GET /audio/{filename}
Serves audio files with proper headers and caching.

**Response Headers:**
```http
Content-Type: audio/wav
Content-Length: 51200
Cache-Control: public, max-age=300
Expires: Mon, 09 Dec 2024 11:00:00 GMT
```

**Error Response (404):**
```json
{
  "status": "error",
  "message": "Audio file not found or expired",
  "error_code": "FILE_NOT_FOUND",
  "debug_info": {
    "filename": "requested_file.wav",
    "possible_causes": [
      "File was cleaned up due to age",
      "Invalid filename format",
      "File was never created"
    ]
  }
}
```

### Content and Resume Data

#### GET /content/types
Lists available content types and their schemas.

**Response:**
```json
{
  "content_types": {
    "projects": {
      "description": "Personal and professional projects",
      "fields": ["id", "title", "description", "technologies", "link", "metrics"],
      "count": 8
    },
    "experience": {
      "description": "Work and internship experience",
      "fields": ["id", "company", "position", "duration", "responsibilities"],
      "count": 5
    },
    "skills": {
      "description": "Technical skills and proficiencies",
      "fields": ["name", "category", "proficiency", "experience_years"],
      "count": 25
    },
    "education": {
      "description": "Academic background and qualifications",
      "fields": ["institution", "degree", "field", "graduation_year"],
      "count": 2
    },
    "publications": {
      "description": "Research papers and publications",
      "fields": ["title", "authors", "venue", "year", "link"],
      "count": 3
    }
  }
}
```

#### GET /content/{type}
Retrieves all items of a specific content type.

**Example: GET /content/projects**
```json
{
  "type": "projects",
  "items": [
    {
      "id": "chicago-crime-forecasting",
      "title": "Chicago Crime Forecasting",
      "description": "Machine learning model for predicting crime patterns using historical data",
      "technologies": ["Python", "TensorFlow", "Pandas", "Scikit-learn"],
      "link": "https://github.com/user/chicago-crime-forecasting",
      "metrics": "89% accuracy improvement over baseline",
      "keywords": ["machine learning", "crime prediction", "data science"],
      "status": "completed",
      "featured": true
    }
  ],
  "total_items": 8,
  "last_updated": "2024-12-01T00:00:00Z"
}
```

#### GET /content/search
Searches across all content types.

**Query Parameters:**
- `q`: Search query
- `type`: Filter by content type
- `tech`: Filter by technology
- `limit`: Maximum results (default: 10)

**Example: GET /content/search?q=machine%20learning&type=projects&limit=5**
```json
{
  "query": "machine learning",
  "filters": {
    "type": "projects",
    "limit": 5
  },
  "results": [
    {
      "id": "chicago-crime-forecasting",
      "title": "Chicago Crime Forecasting",
      "type": "project",
      "relevance_score": 0.95,
      "match_reasons": ["title contains 'machine learning'", "technologies include ML frameworks"]
    }
  ],
  "total_results": 3,
  "search_time_ms": 12.5
}
```

## Error Codes

### HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error
- `503 Service Unavailable`: Service temporarily unavailable

### Custom Error Codes
- `AUDIO_TOO_SHORT`: Audio file duration too short for processing
- `AUDIO_TOO_LONG`: Audio file exceeds maximum duration
- `AUDIO_FORMAT_UNSUPPORTED`: Audio format not supported
- `TRANSCRIPTION_FAILED`: Speech recognition failed
- `LLM_TIMEOUT`: Language model request timed out
- `TTS_FAILED`: Text-to-speech synthesis failed
- `SESSION_EXPIRED`: Session has expired
- `RATE_LIMIT_EXCEEDED`: API rate limit exceeded
- `INVALID_AUDIO`: Audio file is corrupted or invalid

## Rate Limiting

The API implements rate limiting to ensure fair usage:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

**Limits:**
- Audio processing: 60 requests per minute
- TTS generation: 100 requests per minute
- Content queries: 200 requests per minute

## WebSocket Support (Future)

Planning to implement WebSocket support for real-time audio streaming:

```javascript
// Future WebSocket API
const ws = new WebSocket('ws://localhost:8000/ws/audio');
ws.send(audioChunk);
```

## SDKs and Client Libraries

### JavaScript/TypeScript
```javascript
import { ConversationalAI } from 'conversational-ai-client';

const client = new ConversationalAI({
  baseUrl: 'http://localhost:8000',
  sessionId: 'your-session-id'
});

const result = await client.processAudio(audioFile);
```

### Python
```python
from conversational_ai_client import ConversationalAIClient

client = ConversationalAIClient(base_url='http://localhost:8000')
result = client.process_audio('audio_file.wav')
```

## Changelog

### v1.0.0 (Current)
- Initial release with full audio processing pipeline
- Groq LLM integration
- Edge TTS support
- Intelligent content selection
- Audio cleanup service

### Planned Features
- Real-time audio streaming
- Multi-language support
- Custom voice training
- Advanced conversation context
- Performance analytics dashboard