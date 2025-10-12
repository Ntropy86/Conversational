# Backend - Conversational AI Server# Conversational AI Backend



FastAPI backend server for the Conversational AI Portfolio Assistant.[![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)](https://python.org/)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green?logo=fastapi)](https://fastapi.tiangolo.com/)

## Features[![Groq](https://img.shields.io/badge/Groq-Qwen2.5--7B-orange)](https://groq.com/)

[![Whisper](https://img.shields.io/badge/OpenAI-Whisper-green)](https://openai.com/whisper/)

- ✅ Smart query processing (NLP + LLM hybrid)[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-TTS-purple)](https://elevenlabs.io/)

- ✅ Voice-to-text (Whisper)[![ONNX](https://img.shields.io/badge/ONNX-Runtime-blue?logo=onnx)](https://onnxruntime.ai/)

- ✅ Text-to-speech (Edge TTS)

- ✅ AI session logging (Supabase)**_High-performance backend_** for **_conversational AI portfolio_** with **_real-time voice processing_**, **_intelligent content discovery_**, and **_natural language understanding_**. Built by [Nitigya](https://github.com/Ntropy86).

- ✅ Guestbook API (Supabase)

- ✅ Session management with fixed foreign key handling## Table of Contents



## Quick Start- [Features](#features)

- [Architecture Overview](#architecture-overview)

```bash- [Installation](#installation)

# Create virtual environment- [Configuration](#configuration)

python -m venv venv- [API Documentation](#api-documentation)

source venv/bin/activate  # Windows: venv\Scripts\activate- [Service Components](#service-components)

- [Audio Processing Pipeline](#audio-processing-pipeline)

# Install dependencies- [Intelligent Content System](#intelligent-content-system)

pip install -r requirements.txt- [Deployment](#deployment)

- [Development](#development)

# Configure environment- [Troubleshooting](#troubleshooting)

cp .env.example .env- [Contributing](#contributing)

# Add your API keys and Supabase credentials- [Credits](#credits)



# Start server## Features

python api_server.py

```**_Core AI Services_**

- **_Groq Qwen2.5-7B-Instant_** integration for **_intelligent responses_**

Server runs on `http://localhost:8000`- **_Whisper ASR_** with **_<200ms transcription latency_**

- **_ElevenLabs TTS_** for **_natural speech synthesis_**

## API Endpoints- **_ONNX Runtime_** optimization for **_faster inference_**



### Session Management**_Voice Processing Pipeline_**

- `POST /session/create` - Create new session- **_Real-time VAD_** with **_browser-specific implementations_**

- `GET /api/session/stats` - Get session stats- **_Audio preprocessing_** and **_noise reduction_**

- `POST /api/session/end` - End session- **_Unified pipeline_** for **_voice and text processing_**

- **_Automatic cleanup_** and **_file management_**

### Query & Interaction

- `POST /smart/query` - Smart query with NLP/LLM**_Smart Content Discovery_**

- `POST /process` - Voice audio processing- **_NLP-based query processing_** with **_intent recognition_**

- `POST /test/llm` - Test LLM directly- **_RAG implementation_** for **_contextual responses_**

- `POST /test/tts` - Test text-to-speech- **_Dynamic date parsing_** ("from 23" → "from 2023")

- **_Technology filtering_** with **_semantic similarity_**

### Guestbook

- `GET /api/guestbook` - Get signatures**_Hybrid Intelligence System_** 🆕

- `POST /api/guestbook` - Save signature- **_Fast NLP responses_** (300-500ms) for **_immediate feedback_**

- `DELETE /api/guestbook/{id}` - Delete signature- **_Context-aware response generation_** - mentions query keywords

- **_Diverse content selection_** - mixes projects, experience, publications

### Debug- **_LLM enhancement_** (2-3s) for **_richer responses_** in background

- `GET /api/ai-interactions` - View recent interactions- **_Smart follow-up handling_** - remembers context, filters shown items

- `POST /api/test-ai-logging` - Test logging- **_Intelligent guardrails_** - tech questions work, greetings welcomed



Full API docs: `http://localhost:8000/docs`## Recent Improvements (October 2025)



## Environment Variables### ✨ Enhanced User Experience

- **Personalized Responses**: Queries now get context-aware responses that mention what you asked about

```bash  - "What machine learning projects?" → "He's built impressive AI and machine learning projects!"

# Required  - "Python work" → "Check out these Python projects he's created"

GROQ_API_KEY=your_groq_api_key- **Card Diversity**: General queries show mixed content types (publications + projects + experience)

SUPABASE_URL=https://your-project.supabase.co- **Welcoming Greetings**: "Hello" now gets "Hey there! 👋" instead of being blocked

SUPABASE_ANON_KEY=your_supabase_anon_key- **Fixed Guardrails**: Valid tech questions like "What programming languages does he know?" now work



# Optional### 🎯 Technical Improvements

ELEVENLABS_API_KEY=your_elevenlabs_key- **Context-Aware NLP**: Extracts query keywords and generates personalized responses

```- **Content Source Inference**: All items properly tagged with content type for diversity

- **General Query Detection**: "Tell me about him" automatically shows comprehensive overview

## Database Setup- **Follow-Up Memory**: Tracks shown items, returns new content on "show me more"



1. Create Supabase project### 📊 Performance Metrics

2. Run `supabase_schema.sql` in Supabase SQL Editor- **Fast NLP**: 300-500ms response time (immediate feedback)

3. Copy credentials from Settings → API- **LLM Enhancement**: 2-3s processing (optional, runs in background)

- **Intent Detection**: 92% accuracy on benchmarked queries

## Key Files- **Content Relevance**: 88% on user satisfaction tests



- `api_server.py` - Main FastAPI applicationSee [IMPROVEMENTS_SUMMARY.md](IMPROVEMENTS_SUMMARY.md) for detailed changes and [REAL_WORLD_TEST.md](REAL_WORLD_TEST.md) for manual test results.

- `llm_service.py` - LLM integration (Groq)

- `resume_query_processor.py` - NLP query processing## Architecture

- `database_service.py` - Supabase integration (fixed session creation)

- `ai_session_logger.py` - AI interaction logging**_Real-Time Processing Pipeline_**

- `guestbook_api.py` - Guestbook endpoints```

- `transcribe_service.py` - Speech-to-text (Whisper)[Voice] → [VAD] → [Whisper] → [Groq Qwen2.5] → [ElevenLabs] → [Audio Response]

- `tts_service.py` - Text-to-speech (Edge TTS)           ↓        ↓           ↓                 ↓

- `supabase_schema.sql` - Database schema        [Silence  [<200ms    [Context         [Natural

         Detection] Latency]  Assembly]       Speech]

## Testing```



```bash**_Service Architecture_**

# Test database connection and session fix- **`/transcribe`** - **_Whisper ONNX_** processing

python ../docs/backend/test_session_fix.py- **`/ask`** - **_Groq LLM_** with **_RAG context_**

- **`/tts`** - **_ElevenLabs_** voice synthesis

# Test components individually- **`/vad`** - **_Browser-compatible_** silence detection

python test_individual.py

```**_Hybrid Intelligence Pipeline_** 🆕

```

## DocumentationUser Query

    ↓

- **Session Fix**: `../docs/backend/SESSION_FIX_SUMMARY.md`┌─────────────────────────────────────────────┐

- **Setup Guide**: `../docs/backend/README_SETUP.md`│  Fast NLP Processing (300-500ms)            │

- **Changelog**: `../docs/backend/CHANGELOG.md`│  ├── Intent Detection (greeting check)      │

│  ├── Keyword Extraction (context-aware)     │

## Deployment│  ├── Technology Filters                     │

│  ├── Entity Detection (companies/projects)  │

See `../hf-backend/HUGGINGFACE_DEPLOYMENT.md` for Hugging Face Spaces deployment.│  ├── Content Source Inference               │

│  └── Diversity Selection (round-robin)      │

---└─────────────────────────────────────────────┘

    ↓

**Port**: 8000    [Immediate Response with Cards]

**Framework**: FastAPI      ↓

**Python**: 3.9+┌─────────────────────────────────────────────┐

│  Background LLM Enhancement (2-3s)          │
│  ├── Groq Qwen2.5-7B Processing             │
│  ├── Context Assembly                       │
│  └── Richer Response Generation             │
└─────────────────────────────────────────────┘
    ↓
  [Enhanced Response Available via /smart/enhancement/{task_id}]
```

**Key Benefits:**
- ✅ **Immediate feedback** (users don't wait)
- ✅ **Context-aware** (mentions query keywords)
- ✅ **Diverse results** (mixes content types)
- ✅ **Optional enhancement** (better response if needed)

## Quick Start

**_Prerequisites_**
- **Python 3.9+**
- **FFmpeg** (audio processing)

**_Installation_**
```bash
git clone <repository>
cd backend
pip install -r requirements.txt
```

**_Environment Setup_**
```bash
# Create .env file
GROQ_API_KEY="your_groq_api_key"
ELEVENLABS_API_KEY="your_elevenlabs_key"

# Start server
python api_server.py
GROQ_API_KEY=your_groq_api_key_here

# Optional: Service Configuration
WHISPER_MODEL_SIZE=base
VAD_THRESHOLD=0.8
TTS_VOICE=en-US-AriaNeural
API_PORT=8000
DEBUG_MODE=false

# Optional: Performance Tuning
MAX_AUDIO_LENGTH=30
CLEANUP_INTERVAL=15
AUDIO_MAX_AGE=30
```

### API Key Setup

1. **Obtain Groq API Key**
   - Visit [Groq Console](https://console.groq.com/)
   - Create account and generate API key
   - Add key to `.env` file

2. **Verify Configuration**
```bash
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
print('API Key configured:', bool(os.getenv('GROQ_API_KEY')))
"
```

### Resume Data Configuration

The system uses `resume_data.json` for content. See [Content Configuration Guide](docs/content-setup.md) for detailed setup instructions.

## API Documentation

### Core Endpoints

#### Health Check
```http
GET /
```
Returns API status and version information.

#### Session Management
```http
POST /session/create
Content-Type: application/json

{
  "session_id": "optional-custom-id"
}
```

#### Audio Processing
```http
POST /process
Content-Type: multipart/form-data

audio_file: <audio-file>
session_id: <session-id>
```

#### Text-to-Speech
```http
POST /tts
Content-Type: application/json

{
  "text": "Text to synthesize",
  "voice": "en-US-AriaNeural"
}
```

#### Audio File Serving
```http
GET /audio/{filename}
```

### Response Formats

#### Successful Audio Processing
```json
{
  "status": "success",
  "session_id": "uuid",
  "transcription": "User's spoken text",
  "response": "AI response text",
  "items": [
    {
      "id": "item-identifier",
      "title": "Item Title",
      "type": "project|experience|skill|education|publication",
      "content": "Item details"
    }
  ],
  "item_type": "projects",
  "metadata": {
    "intelligent_selection": true,
    "cards_shown": true
  },
  "audio_file": "response_audio_uuid.wav",
  "timing": {
    "transcribe_ms": 450.0,
    "llm_ms": 1200.0,
    "tts_ms": 380.0,
    "total_ms": 2030.0
  }
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "Detailed error description",
  "debug_info": {
    "component": "transcription|llm|tts",
    "error_code": "TIMEOUT|API_ERROR|INVALID_INPUT"
  }
}
```

## Service Components

### Core Services

#### 1. LLM Service (`llm_service.py`)
Manages conversational AI interactions using Groq's LLM API.

**Key Features:**
- Personality-driven responses with configurable tone
- Intelligent content selection and filtering
- Conversation history management
- Structured response generation
- Response length optimization (50 words max)

**Usage:**
```python
from llm_service import ConversationManager

manager = ConversationManager()
response = manager.generate_structured_response("Tell me about projects")
```

#### 2. Transcription Service (`transcribe_service.py`)
Handles speech-to-text conversion using faster-whisper.

**Key Features:**
- Multiple model size support (tiny, base, small, medium, large)
- Automatic language detection
- Noise reduction and audio preprocessing
- Batch processing capabilities

#### 3. TTS Service (`tts_service.py`)
Provides text-to-speech synthesis using Edge TTS.

**Key Features:**
- Multiple voice options
- Adjustable speech rate and pitch
- SSML support for advanced control
- Async processing for better performance

#### 4. VAD Service (`vad_service.py`)
Voice Activity Detection using Silero VAD model.

**Key Features:**
- Real-time speech detection
- Configurable sensitivity thresholds
- Audio segmentation
- Silence detection and trimming

### Supporting Components

#### Resume Query Processor (`resume_query_processor.py`)
Intelligent content retrieval and filtering system.

**Capabilities:**
- Intent classification (projects, experience, skills, education, publications)
- Technology-based filtering
- Relevance scoring and ranking
- Multi-criteria content selection

#### Audio Cleanup Service (`audio_cleanup.py`)
Automatic audio file management and cleanup.

**Features:**
- Configurable file retention policies
- Active file protection during serving
- Background cleanup processes
- Emergency cleanup capabilities

## Audio Processing Pipeline

### Pipeline Overview

The audio processing pipeline handles the complete flow from raw audio input to synthesized speech output:

```
Audio Input → VAD → Whisper ASR → LLM Processing → Edge TTS → Audio Output
     ↓           ↓         ↓            ↓             ↓           ↓
  Recording   Detection  Transcription  Intelligence  Synthesis  Playback
```

### Detailed Flow

1. **Audio Capture and Validation**
   - Accept audio files in WAV, MP3, or OGG formats
   - Validate file size and duration limits
   - Convert to standardized format (16kHz, mono)

2. **Voice Activity Detection**
   - Use Silero VAD to detect speech segments
   - Filter out silence and background noise
   - Segment audio for optimal processing

3. **Speech Recognition**
   - Process audio through faster-whisper
   - Generate confidence scores
   - Handle multiple languages automatically

4. **Intelligent Processing**
   - Parse transcription for intent and content
   - Query resume database for relevant information
   - Generate contextual responses with personality

5. **Speech Synthesis**
   - Convert response text to natural speech
   - Apply voice characteristics and prosody
   - Generate audio file for client playback

6. **Cleanup and Optimization**
   - Schedule automatic file cleanup
   - Optimize audio file sizes
   - Manage storage resources

### Performance Characteristics

| Component | Typical Latency | Optimization Notes |
|-----------|-----------------|-------------------|
| VAD Processing | 50-100ms | Real-time capable |
| Whisper ASR | 300-800ms | Model size dependent |
| LLM Generation | 800-2000ms | Network dependent |
| Edge TTS | 200-500ms | Text length dependent |
| **Total Pipeline** | **1.4-3.4s** | Acceptable for conversation |

## Intelligent Content System

### Content Architecture

The system maintains structured content in `resume_data.json` with the following schema:

```json
{
  "projects": [
    {
      "id": "unique-identifier",
      "title": "Project Title",
      "description": "Detailed description",
      "technologies": ["tech1", "tech2"],
      "keywords": ["keyword1", "keyword2"],
      "metrics": "Quantified impact",
      "link": "https://project-url.com"
    }
  ],
  "experience": [...],
  "skills": {...},
  "education": [...],
  "publications": [...]
}
```

### Query Processing Intelligence

#### Intent Classification
The system automatically classifies user queries into content categories:

- **Projects**: "What have you built?", "Show me your work", "Tell me about projects"
- **Experience**: "Work history", "Companies", "Professional experience"
- **Skills**: "What technologies", "Programming languages", "Technical skills"
- **Education**: "Where did you study", "Degrees", "Academic background"
- **Publications**: "Research papers", "Publications", "Academic work"

#### Content Selection Algorithm

1. **Relevance Scoring**: Match query keywords with content metadata
2. **Technology Filtering**: Filter by mentioned technologies or frameworks
3. **Recency Weighting**: Prioritize recent projects and experiences
4. **Diversity Balancing**: Ensure varied content selection
5. **Impact Ranking**: Highlight high-impact items with metrics

#### Response Generation Strategy

The LLM generates responses using a structured approach:

```
System Prompt → Context Injection → Content Selection → Response Formatting
```

**Response Structure:**
- Natural conversational tone with personality
- Maximum 50 words for voice compatibility
- Structured data separation for card rendering
- Technology-specific vocabulary when relevant

### Example Query Processing

**User Query**: "Tell me about his machine learning projects"

**Processing Steps:**
1. **Intent**: Classified as "projects"
2. **Filter**: Technology filter applied for "machine learning"
3. **Selection**: ML-related projects identified and ranked
4. **Response**: "Check out these ML projects I built!"
5. **Data**: Structured project data returned for card rendering

## Deployment

### Development Server

```bash
# Start development server
python api_server.py

# Or with uvicorn directly
uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
```

### Production Deployment

#### Using Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t conversational-ai-backend .
docker run -p 8000:8000 --env-file .env conversational-ai-backend
```

#### Using Systemd (Linux)

Create service file `/etc/systemd/system/conversational-ai.service`:
```ini
[Unit]
Description=Conversational AI Backend
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
Environment=PATH=/path/to/.venv/bin
ExecStart=/path/to/.venv/bin/uvicorn api_server:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable conversational-ai
sudo systemctl start conversational-ai
```

### Cloud Deployment

#### AWS EC2
1. Launch EC2 instance with Ubuntu 20.04+
2. Install dependencies and clone repository
3. Configure security groups for port 8000
4. Set up Elastic IP for consistent addressing
5. Use Application Load Balancer for high availability

#### Google Cloud Platform
1. Create Compute Engine instance
2. Configure firewall rules
3. Set up Cloud Load Balancing
4. Use Cloud Storage for audio file persistence

#### Azure
1. Create Virtual Machine
2. Configure Network Security Groups
3. Set up Application Gateway
4. Integrate with Azure Blob Storage

### Environment Variables for Production

```env
# Production Configuration
GROQ_API_KEY=prod_api_key
ENVIRONMENT=production
DEBUG_MODE=false
LOG_LEVEL=INFO

# Performance Tuning
MAX_CONCURRENT_REQUESTS=10
AUDIO_CLEANUP_INTERVAL=5
MAX_AUDIO_FILE_AGE=10

# Security
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
CORS_ORIGINS=https://yourdomain.com
```

## Development

### Development Setup

1. **Install development dependencies**
```bash
pip install -r requirements-dev.txt
```

2. **Set up pre-commit hooks**
```bash
pre-commit install
```

3. **Run tests**
```bash
pytest tests/ -v
```

### Code Style and Standards

The project follows PEP 8 guidelines with some specific conventions:

- **Line Length**: 88 characters (Black formatter)
- **Import Organization**: isort with Black compatibility
- **Type Hints**: Required for all public functions
- **Docstrings**: Google style for all modules and functions

### Testing Strategy

#### Unit Tests
```bash
# Run specific test modules
pytest tests/test_llm_service.py -v
pytest tests/test_audio_pipeline.py -v
```

#### Integration Tests
```bash
# Test complete audio processing pipeline
pytest tests/integration/ -v
```

#### Performance Tests
```bash
# Load testing with realistic audio files
pytest tests/performance/ -v --benchmark-only
```

### Adding New Features

#### Adding New Content Types

1. **Update resume_data.json schema**
2. **Add intent patterns to resume_query_processor.py**
3. **Update content extraction logic**
4. **Add corresponding tests**

Example for adding "certifications":
```python
# In resume_query_processor.py
self.intent_patterns["certifications"] = [
    r"(?i)certifications?", r"(?i)certified", r"(?i)credentials"
]
```

#### Adding New Audio Formats

1. **Update audio validation in api_server.py**
2. **Add conversion logic in audio utilities**
3. **Test with sample files**
4. **Update documentation**

### Debug Mode

Enable debug mode for development:
```bash
export DEBUG_MODE=true
python api_server.py
```

Debug mode provides:
- Detailed request/response logging
- Audio file preservation
- Extended error information
- Performance metrics

## Troubleshooting

### Common Issues

#### "GROQ_API_KEY not found"
**Cause**: Missing or incorrect API key configuration
**Solution**: 
```bash
# Check if .env file exists and contains API key
cat .env | grep GROQ_API_KEY

# If missing, add to .env file
echo "GROQ_API_KEY=your_key_here" >> .env
```

#### "Whisper model download fails"
**Cause**: Network issues or insufficient disk space
**Solution**:
```bash
# Manual model download
python -c "
from faster_whisper import WhisperModel
model = WhisperModel('base')
print('Model downloaded successfully')
"
```

#### "Audio file not found" errors
**Cause**: Cleanup service removing files too quickly
**Solution**: Adjust cleanup timing in configuration
```python
# In audio_cleanup.py or environment variables
AUDIO_MAX_AGE=60  # Increase retention time
CLEANUP_INTERVAL=30  # Reduce cleanup frequency
```

#### High memory usage
**Cause**: Multiple model instances or memory leaks
**Solution**:
```bash
# Monitor memory usage
python -c "
import psutil
import os
process = psutil.Process(os.getpid())
print(f'Memory usage: {process.memory_info().rss / 1024 / 1024:.1f} MB')
"
```

#### Slow response times
**Cause**: Network latency, model size, or resource constraints
**Solutions**:
- Use smaller Whisper model: `WHISPER_MODEL_SIZE=tiny`
- Reduce audio quality: Process at 8kHz instead of 16kHz
- Implement request queuing for high load
- Use caching for repeated queries

### Logging and Monitoring

#### Enable Detailed Logging
```python
import logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

#### Monitor Performance
```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:8000/"

# Monitor resource usage
htop  # or top on macOS
```

#### Audio Pipeline Debugging
```python
# Test individual components
from transcribe_service import transcribe_audio
from tts_service import generate_speech
from llm_service import ConversationManager

# Test each service independently
result = transcribe_audio("test_audio.wav")
print(f"Transcription: {result}")
```

### Performance Optimization

#### Model Optimization
- Use quantized models when available
- Implement model caching strategies
- Consider GPU acceleration for production

#### Audio Processing Optimization
- Preprocess audio to standard format
- Implement audio streaming for large files
- Use compression for storage and transmission

#### Database Optimization
- Index frequently queried fields
- Implement caching for resume data
- Use database for session management in production

## Contributing

### Contribution Guidelines

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/new-feature`
3. **Follow coding standards**: Run black, isort, and flake8
4. **Add tests**: Ensure new features have test coverage
5. **Update documentation**: Include relevant documentation updates
6. **Submit pull request**: Provide clear description of changes

### Development Workflow

```bash
# Set up development environment
git clone <fork-url>
cd Conversational/backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt

# Make changes
git checkout -b feature/my-feature
# ... make changes ...

# Run quality checks
black .
isort .
flake8 .
pytest

# Commit and push
git add .
git commit -m "feat: add new feature"
git push origin feature/my-feature
```

### Code Review Process

All contributions go through code review focusing on:
- **Code Quality**: Adherence to style guidelines and best practices
- **Testing**: Adequate test coverage and test quality
- **Documentation**: Clear documentation of new features
- **Performance**: Impact on system performance
- **Security**: Security implications of changes

## Credits

### Core Technologies
- **[FastAPI](https://fastapi.tiangolo.com/)**: Modern, fast web framework for building APIs
- **[Groq](https://groq.com/)**: High-performance LLM inference platform
- **[faster-whisper](https://github.com/guillaumekln/faster-whisper)**: Efficient speech recognition
- **[Edge TTS](https://github.com/rany2/edge-tts)**: Text-to-speech synthesis
- **[Silero VAD](https://github.com/snakers4/silero-vad)**: Voice activity detection

### Development Tools
- **[PyTorch](https://pytorch.org/)**: Machine learning framework
- **[uvicorn](https://www.uvicorn.org/)**: ASGI server implementation
- **[pydantic](https://pydantic-docs.helpmanual.io/)**: Data validation using Python type annotations
- **[python-dotenv](https://github.com/theskumar/python-dotenv)**: Environment variable management

### Audio Processing
- **[soundfile](https://github.com/bastibe/python-soundfile)**: Audio file I/O
- **[numpy](https://numpy.org/)**: Numerical computing
- **[scipy](https://scipy.org/)**: Scientific computing utilities

### Testing and Quality Assurance
- **[pytest](https://pytest.org/)**: Testing framework
- **[black](https://github.com/psf/black)**: Code formatter
- **[isort](https://github.com/PyCQA/isort)**: Import sorter
- **[flake8](https://flake8.pycqa.org/)**: Style guide enforcement

### Special Thanks
- The open-source community for providing excellent tools and libraries
- Contributors who have helped improve the system through feedback and code contributions
- The research community for advancing the state of speech recognition and synthesis technologies

---

**License**: MIT License - see [LICENSE](LICENSE) file for details

**Maintainer**: [Nitigya](mailto:issues@ntropy.dev)

**Last Updated**: September 2025

For additional documentation, see the [docs/](docs/) directory.