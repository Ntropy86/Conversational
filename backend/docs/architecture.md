# Architecture Guide

This document provides a deep dive into the system architecture, design patterns, and implementation details of the Conversational AI Backend.

## System Architecture Overview

The backend follows a modular, service-oriented architecture designed for scalability, maintainability, and real-time performance.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Web App    │  │ Mobile App  │  │   API       │            │
│  │ (Frontend)  │  │   (Future)  │  │  Clients    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │     API Gateway       │
                    │    (FastAPI + CORS)   │
                    └───────────▲───────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                    Core Services Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Session   │  │    Audio    │  │  Content    │            │
│  │ Management  │  │ Processing  │  │  Service    │            │
│  └─────────────┘  └─────────────▼  └─────────────┘            │
│                   ┌─────────────────────────────┐              │
│                   │    Audio Pipeline           │              │
│                   │ ┌─────┐ ┌─────┐ ┌─────┐    │              │
│                   │ │ VAD │ │ ASR │ │ TTS │    │              │
│                   │ └─────┘ └─────┘ └─────┘    │              │
│                   └─────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                   Intelligence Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │    LLM      │  │   Query     │  │  Response   │            │
│  │  Service    │  │ Processor   │  │  Generator  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
                                │
┌─────────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   File      │  │   Cleanup   │  │    Data     │            │
│  │  Storage    │  │   Service   │  │   Storage   │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

**<BOLD>Detailed system architecture diagram showing data flow between all layers and components with specific service interactions</BOLD>**

## Core Components

### 1. API Gateway (`api_server.py`)

The FastAPI-based gateway serves as the main entry point for all client requests.

#### Key Responsibilities:
- **Request Routing**: Route incoming requests to appropriate services
- **Authentication**: Handle API key validation and session management
- **CORS Management**: Configure cross-origin resource sharing
- **Request Validation**: Validate input parameters and file formats
- **Response Formatting**: Standardize response formats across endpoints
- **Error Handling**: Centralized error handling and logging

#### Design Patterns:
- **Dependency Injection**: Services injected as FastAPI dependencies
- **Middleware Pattern**: CORS and logging middleware
- **Decorator Pattern**: Route decorators for common functionality

```python
# Example service injection
@app.post("/process")
async def process_audio(
    audio_file: UploadFile,
    session_id: str,
    conversation_manager: ConversationManager = Depends(get_conversation_manager)
):
    # Process request using injected service
    pass
```

### 2. Session Management System

#### Session Lifecycle:
1. **Creation**: Generate UUID-based session identifiers
2. **Storage**: In-memory storage with optional persistence
3. **Validation**: Ensure session exists and hasn't expired
4. **Cleanup**: Automatic cleanup of expired sessions

#### Session Data Structure:
```python
{
    "session_id": "uuid-v4",
    "created_at": "ISO-8601-timestamp",
    "last_activity": "ISO-8601-timestamp", 
    "conversation_history": [
        {
            "timestamp": "ISO-8601-timestamp",
            "user_input": "transcribed-text",
            "ai_response": "generated-response",
            "items_shown": ["item-id-1", "item-id-2"],
            "item_type": "projects|experience|skills|education|publications"
        }
    ],
    "metadata": {
        "total_interactions": 0,
        "average_response_time": 0.0,
        "preferred_voice": "en-US-AriaNeural"
    }
}
```

### 3. Audio Processing Pipeline

The audio pipeline implements a sophisticated multi-stage processing system optimized for conversational AI.

#### Pipeline Stages:

##### Stage 1: Audio Ingestion and Validation
```python
# Pseudo-code for audio validation
def validate_audio(audio_file):
    # Check file format
    if not audio_file.content_type in SUPPORTED_FORMATS:
        raise UnsupportedFormatError()
    
    # Check file size
    if audio_file.size > MAX_FILE_SIZE:
        raise FileTooLargeError()
    
    # Check duration
    duration = get_audio_duration(audio_file)
    if duration > MAX_DURATION:
        raise AudioTooLongError()
    
    return True
```

##### Stage 2: Voice Activity Detection (VAD)
- **Model**: Silero VAD v3.1
- **Purpose**: Detect speech segments and filter noise
- **Output**: Clean audio segments with timestamps

##### Stage 3: Speech Recognition (ASR)
- **Model**: faster-whisper (OpenAI Whisper optimized)
- **Language**: Auto-detection with fallback to English
- **Output**: Transcribed text with confidence scores

##### Stage 4: Intelligence Processing
- **Query Analysis**: Intent classification and entity extraction
- **Content Retrieval**: Smart content selection based on query
- **Response Generation**: Personality-driven response creation

##### Stage 5: Text-to-Speech (TTS)
- **Engine**: Microsoft Edge TTS
- **Voice Selection**: Configurable with fallback
- **Output**: High-quality audio file

#### Performance Characteristics:
| Stage | Typical Latency | Bottlenecks | Optimizations |
|-------|-----------------|-------------|---------------|
| Validation | 10-50ms | File I/O | Async processing |
| VAD | 50-100ms | Model inference | Batching |
| ASR | 300-800ms | Model size, audio length | Model quantization |
| Intelligence | 800-2000ms | API latency | Caching, parallel processing |
| TTS | 200-500ms | Text length | Streaming synthesis |

### 4. Intelligence Layer

#### LLM Service Architecture

The LLM service implements a sophisticated conversation management system with intelligent content selection.

```python
class ConversationManager:
    def __init__(self):
        self.groq_client = Groq(api_key=GROQ_API_KEY)
        self.query_processor = ResumeQueryProcessor()
        self.conversation_history = {}
    
    async def generate_structured_response(self, query: str, session_id: str):
        # 1. Analyze query intent
        intent_analysis = self.query_processor.analyze_intent(query)
        
        # 2. Retrieve relevant content
        relevant_items = self.query_processor.get_relevant_items(
            query, intent_analysis
        )
        
        # 3. Generate contextual response
        response = await self._generate_llm_response(
            query, relevant_items, session_id
        )
        
        # 4. Parse structured output
        return self._parse_structured_response(response)
```

#### Query Processing Intelligence

The query processor implements several AI techniques for intelligent content selection:

##### Intent Classification:
- **Rule-based patterns**: Regex patterns for common intents
- **Keyword matching**: Technology and domain-specific keywords
- **Context awareness**: Previous conversation context
- **Confidence scoring**: Multi-factor relevance scoring

##### Content Selection Algorithm:
```python
def calculate_relevance_score(query, item):
    score = 0.0
    
    # Keyword matching (40% weight)
    keyword_score = calculate_keyword_match(query, item)
    score += keyword_score * 0.4
    
    # Technology alignment (30% weight)
    tech_score = calculate_technology_match(query, item)
    score += tech_score * 0.3
    
    # Recency factor (20% weight)
    recency_score = calculate_recency_score(item)
    score += recency_score * 0.2
    
    # Impact metrics (10% weight)
    impact_score = calculate_impact_score(item)
    score += impact_score * 0.1
    
    return min(score, 1.0)
```

### 5. Data Management

#### Content Data Structure

The system uses a JSON-based content management system optimized for query performance:

```json
{
  "projects": [
    {
      "id": "unique-identifier",
      "title": "Human-readable title",
      "description": "Detailed description",
      "technologies": ["tech1", "tech2"],
      "keywords": ["domain-keywords"],
      "metrics": "Quantified impact",
      "link": "URL",
      "metadata": {
        "created_date": "ISO-8601",
        "featured": boolean,
        "difficulty": "beginner|intermediate|advanced",
        "status": "completed|in-progress|planned"
      }
    }
  ]
}
```

#### Data Access Patterns:
- **Read-heavy**: Optimized for frequent content queries
- **Batch updates**: Content updated in batches, not real-time
- **Caching**: In-memory caching of frequently accessed items
- **Indexing**: Pre-computed indices for common query patterns

### 6. File Management and Cleanup

#### Audio File Lifecycle:
```
Creation → Active Use → Inactive → Scheduled Cleanup → Deletion
    │         │           │              │             │
    │         │           │              │             └─ Permanent removal
    │         │           │              └─ Background process
    │         │           └─ No active serving
    │         └─ Currently being served to client
    └─ TTS generation or upload processing
```

#### Cleanup Service Architecture:
```python
class AudioCleanupService:
    def __init__(self):
        self.active_files = set()
        self.cleanup_scheduler = BackgroundScheduler()
        self.start_background_cleanup()
    
    def mark_file_active(self, filename):
        """Mark file as actively being served"""
        self.active_files.add(filename)
    
    def mark_file_inactive(self, filename):
        """File no longer being served"""
        self.active_files.discard(filename)
    
    def scheduled_cleanup(self):
        """Remove old, inactive files"""
        cutoff_time = time.time() - MAX_FILE_AGE
        for filepath in self.get_cleanup_candidates(cutoff_time):
            if self.is_safe_to_delete(filepath):
                self.delete_file(filepath)
```

## Design Patterns and Principles

### 1. Dependency Injection Pattern

Services are injected as dependencies to promote loose coupling and testability:

```python
# Service registration
def get_conversation_manager():
    return ConversationManager()

def get_audio_cleanup_service():
    return AudioCleanupService()

# Dependency injection in routes
@app.post("/process")
async def process_audio(
    conversation_manager: ConversationManager = Depends(get_conversation_manager),
    cleanup_service: AudioCleanupService = Depends(get_audio_cleanup_service)
):
    # Use injected services
    pass
```

### 2. Strategy Pattern for Audio Processing

Different audio processing strategies for different scenarios:

```python
class AudioProcessingStrategy:
    def process(self, audio_file):
        raise NotImplementedError

class FastProcessingStrategy(AudioProcessingStrategy):
    """Optimized for speed, lower quality"""
    def process(self, audio_file):
        # Use smaller models, less processing
        pass

class HighQualityProcessingStrategy(AudioProcessingStrategy):
    """Optimized for quality, slower"""
    def process(self, audio_file):
        # Use larger models, more processing
        pass
```

### 3. Observer Pattern for Event Handling

Components can subscribe to events without tight coupling:

```python
class EventBus:
    def __init__(self):
        self.subscribers = defaultdict(list)
    
    def subscribe(self, event_type, callback):
        self.subscribers[event_type].append(callback)
    
    def publish(self, event_type, data):
        for callback in self.subscribers[event_type]:
            callback(data)

# Usage
event_bus.subscribe('audio_processed', cleanup_service.schedule_cleanup)
event_bus.subscribe('session_ended', session_manager.cleanup_session)
```

### 4. Circuit Breaker Pattern for External APIs

Protect against cascading failures from external service outages:

```python
class CircuitBreaker:
    def __init__(self, failure_threshold=5, timeout=60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failure_count = 0
        self.last_failure_time = None
        self.state = 'CLOSED'  # CLOSED, OPEN, HALF_OPEN
    
    def call(self, func, *args, **kwargs):
        if self.state == 'OPEN':
            if time.time() - self.last_failure_time < self.timeout:
                raise ServiceUnavailableError("Circuit breaker is OPEN")
            else:
                self.state = 'HALF_OPEN'
        
        try:
            result = func(*args, **kwargs)
            self.on_success()
            return result
        except Exception as e:
            self.on_failure()
            raise e
```

## Scalability Considerations

### Horizontal Scaling

The system is designed to support horizontal scaling through:

#### Stateless Design:
- No server-side state beyond session management
- Sessions can be moved to external storage (Redis, Database)
- File storage can be moved to object storage (S3, GCS)

#### Load Balancing Strategies:
```nginx
# Nginx configuration for load balancing
upstream conversational_ai_backend {
    server backend1:8000 weight=3;
    server backend2:8000 weight=2;
    server backend3:8000 weight=1;
}

server {
    listen 80;
    location / {
        proxy_pass http://conversational_ai_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Database Scaling:
- Read replicas for content queries
- Caching layers (Redis, Memcached)
- Content delivery networks for audio files

### Vertical Scaling

Performance optimizations for single-instance scaling:

#### Memory Optimization:
- Model quantization for ML models
- Lazy loading of large models
- Memory pooling for audio buffers

#### CPU Optimization:
- Async/await for I/O operations
- Process pools for CPU-intensive tasks
- GPU acceleration where available

#### Storage Optimization:
- Audio compression without quality loss
- Efficient cleanup algorithms
- SSD storage for temporary files

## Security Architecture

### API Security

#### Authentication and Authorization:
```python
# API key validation
async def validate_api_key(api_key: str = Header(None)):
    if not api_key or not is_valid_api_key(api_key):
        raise HTTPException(401, "Invalid API key")
    return api_key

# Rate limiting
async def rate_limit_check(request: Request):
    client_ip = request.client.host
    if is_rate_limited(client_ip):
        raise HTTPException(429, "Rate limit exceeded")
```

#### Input Validation:
- File type validation with magic number checking
- Audio duration and size limits
- Input sanitization for text queries
- Session ID validation

#### Data Protection:
- Audio files stored temporarily with automatic cleanup
- No persistent storage of user conversations (optional)
- Secure API key management
- HTTPS enforcement in production

### Infrastructure Security

#### Network Security:
- Firewall rules restricting access to necessary ports
- VPN access for administrative tasks
- Network segmentation for different service tiers

#### Container Security:
```dockerfile
# Security-focused Dockerfile
FROM python:3.9-slim

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set secure permissions
COPY --chown=appuser:appuser . /app
USER appuser

# Run with limited privileges
CMD ["uvicorn", "api_server:app"]
```

## Monitoring and Observability

### Logging Strategy

#### Structured Logging:
```python
import structlog

logger = structlog.get_logger()

# Example usage
logger.info(
    "Audio processing completed",
    session_id=session_id,
    duration_ms=processing_time,
    transcription_length=len(transcription),
    response_items=len(items)
)
```

#### Log Levels:
- **DEBUG**: Detailed execution flow for development
- **INFO**: Normal operation events
- **WARNING**: Unusual but recoverable conditions
- **ERROR**: Error conditions that don't stop execution
- **CRITICAL**: Serious errors requiring immediate attention

### Metrics Collection

#### Key Performance Indicators (KPIs):
- Request latency percentiles (P50, P95, P99)
- Error rates by endpoint and error type
- Audio processing success rates
- LLM API response times
- File cleanup efficiency

#### Custom Metrics:
```python
from prometheus_client import Counter, Histogram, Gauge

# Request metrics
REQUEST_COUNT = Counter('requests_total', 'Total requests', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('request_duration_seconds', 'Request latency')

# Audio processing metrics
AUDIO_PROCESSING_TIME = Histogram('audio_processing_seconds', 'Audio processing time')
TRANSCRIPTION_ACCURACY = Gauge('transcription_confidence', 'Transcription confidence')

# Business metrics
CONTENT_CARDS_SHOWN = Counter('content_cards_shown_total', 'Content cards displayed')
SESSION_DURATION = Histogram('session_duration_seconds', 'Session duration')
```

### Health Checks and Alerting

#### Health Check Endpoints:
- `/health`: Basic service health
- `/health/detailed`: Component-level health status
- `/metrics`: Prometheus-compatible metrics

#### Alerting Rules:
- Error rate > 5% for 5 minutes
- Average response time > 5 seconds for 10 minutes
- Disk usage > 80%
- Memory usage > 90%
- External API failures > 10% for 5 minutes

## Future Architecture Considerations

### Microservices Migration

The current monolithic structure can be evolved into microservices:

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Audio     │  │     LLM     │  │   Content   │
│  Service    │  │   Service   │  │   Service   │
└─────────────┘  └─────────────┘  └─────────────┘
       │                 │                 │
       └─────────────────┼─────────────────┘
                         │
           ┌─────────────────────────┐
           │    API Gateway          │
           │  (Kong/Ambassador)      │
           └─────────────────────────┘
```

### Event-Driven Architecture

Transition to event-driven patterns for better scalability:

```python
# Event-driven processing
async def handle_audio_upload(event):
    audio_file = event['audio_file']
    session_id = event['session_id']
    
    # Publish processing events
    await event_bus.publish('audio.vad.requested', {
        'audio_file': audio_file,
        'session_id': session_id
    })

async def handle_vad_completed(event):
    # Process VAD results and trigger ASR
    await event_bus.publish('audio.asr.requested', event)
```

### Machine Learning Pipeline Integration

Enhanced ML capabilities:

- **Custom model training**: User-specific voice adaptation
- **Personalization**: Learning user preferences over time
- **Advanced NLP**: Better intent recognition and response generation
- **Multi-modal**: Support for images and documents

This architecture provides a solid foundation for a conversational AI system while maintaining flexibility for future enhancements and scaling requirements.