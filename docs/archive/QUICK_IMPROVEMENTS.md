# Quick Backend Improvements - Start Here 🚀

This guide contains **immediate, actionable improvements** you can make today to improve the backend quality.

---

## 📝 Day 1: Replace Print Statements with Logging

### Step 1: Create a logging configuration file

Create `backend/core/__init__.py`:
```python
# Empty file to make it a package
```

Create `backend/core/logging_config.py`:
```python
"""Centralized logging configuration"""
import logging
import sys
from pathlib import Path

def setup_logging(log_level: str = "INFO"):
    """Configure logging for the application"""
    
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configure logging format
    log_format = (
        "%(asctime)s | %(levelname)-8s | "
        "%(name)s:%(funcName)s:%(lineno)d | "
        "%(message)s"
    )
    
    # Create formatters
    formatter = logging.Formatter(log_format)
    
    # Console handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(log_level)
    
    # File handler (rotating logs)
    from logging.handlers import RotatingFileHandler
    file_handler = RotatingFileHandler(
        log_dir / "backend.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(log_level)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    
    # Suppress noisy third-party loggers
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    
    return root_logger

# Usage
logger = setup_logging()
```

### Step 2: Update your services to use logging

**Before (api_server.py):**
```python
print(f"Processing audio file: {audio_file.filename}")
print(f"Read {len(file_content)} bytes from upload")
print(f"Audio loaded: {len(audio_data)} samples at {sample_rate}Hz")
```

**After:**
```python
import logging

logger = logging.getLogger(__name__)

logger.info(
    "processing_audio",
    extra={
        "filename": audio_file.filename,
        "bytes_read": len(file_content),
        "samples": len(audio_data),
        "sample_rate": sample_rate
    }
)
```

### Step 3: Update main application

Update `backend/api_server.py`:
```python
from core.logging_config import setup_logging
import logging

# At the top of the file, after imports
logger = setup_logging(log_level="INFO")
app_logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    app_logger.info("🚀 Starting AI Assistant API")
    init_cleanup_service()
    app_logger.info("🧹 Audio cleanup service started")

# Replace all print() statements:
# print(f"Processing audio file...") -> logger.info("processing_audio", extra={...})
```

---

## 🔐 Day 2: Add Input Validation

### Create Pydantic models for validation

Create `backend/models/requests.py`:
```python
"""Request validation models"""
from typing import List, Optional
from pydantic import BaseModel, Field, validator
from fastapi import UploadFile

class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=500)
    session_id: Optional[str] = Field(None, max_length=100)
    conversation_history: List[dict] = Field(default_factory=list, max_items=50)
    
    @validator('text')
    def text_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Text cannot be empty or whitespace')
        return v.strip()
    
    @validator('conversation_history')
    def validate_history(cls, v):
        if len(v) > 50:
            raise ValueError('Conversation history too long (max 50 messages)')
        return v

class SmartRequest(TextRequest):
    user_id: Optional[str] = Field(None, max_length=100)
    
    @validator('user_id')
    def validate_user_id(cls, v):
        if v and not v.replace('-', '').replace('_', '').isalnum():
            raise ValueError('Invalid user_id format')
        return v

class SessionRequest(BaseModel):
    session_id: str = Field(..., min_length=1, max_length=100)

class AudioUploadRequest(BaseModel):
    """Validation for audio uploads"""
    max_size_mb: int = 10
    allowed_formats: List[str] = [".wav", ".mp3", ".ogg"]
```

### Update endpoints to use validation

**Before:**
```python
@app.post("/test/llm")
async def test_llm(request: TextRequest):
    # No validation beyond basic types
    ...
```

**After:**
```python
from models.requests import TextRequest
from fastapi import HTTPException

@app.post("/test/llm")
async def test_llm(request: TextRequest):
    """Test LLM - now with proper validation"""
    try:
        # Pydantic automatically validates
        # request.text is guaranteed to be 1-500 chars, non-empty
        # request.conversation_history is guaranteed to be <= 50 items
        ...
    except ValueError as e:
        logger.warning("validation_error", error=str(e))
        raise HTTPException(status_code=422, detail=str(e))
```

### Add file upload validation

Create `backend/core/validators.py`:
```python
"""Custom validators"""
import os
from fastapi import HTTPException, UploadFile

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_AUDIO_TYPES = ["audio/wav", "audio/mpeg", "audio/ogg"]

async def validate_audio_file(file: UploadFile) -> UploadFile:
    """Validate uploaded audio file"""
    
    # Check content type
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type: {file.content_type}. "
                   f"Allowed: {', '.join(ALLOWED_AUDIO_TYPES)}"
        )
    
    # Check file size
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB chunks
    
    # Read file to check size
    content = await file.read()
    file_size = len(content)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large: {file_size / 1024 / 1024:.2f}MB. "
                   f"Max: {MAX_FILE_SIZE / 1024 / 1024}MB"
        )
    
    # Reset file pointer for later reading
    await file.seek(0)
    
    return file

# Usage in endpoints:
from core.validators import validate_audio_file

@app.post("/process")
async def process_audio(
    audio_file: UploadFile = File(...),
    session_id: str = Form(None)
):
    # Validate file
    audio_file = await validate_audio_file(audio_file)
    ...
```

---

## ⚙️ Day 3: Centralize Configuration

### Create configuration module

Create `backend/core/config.py`:
```python
"""Centralized configuration management"""
from pydantic import BaseSettings, Field
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # API Settings
    api_title: str = "AI Assistant API"
    api_version: str = "1.0.0"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug_mode: bool = False
    
    # CORS Settings
    cors_origins: List[str] = [
        "http://localhost:3000",
        "https://localhost:3000"
    ]
    
    # LLM Settings
    groq_api_key: str = Field(..., env="GROQ_API_KEY")
    llm_model: str = "llama-3.1-8b-instant"
    llm_temperature: float = 0.7
    llm_max_tokens: int = 128
    llm_timeout: float = 5.0
    
    # Query Processing
    max_display_items: int = 4
    max_conversation_history: int = 50
    
    # Rate Limiting
    rate_limit_requests: int = 3
    rate_limit_window: int = 3600  # seconds
    
    # Audio Settings
    whisper_model: str = "base"
    sample_rate: int = 16000
    max_audio_duration: int = 30  # seconds
    audio_cleanup_interval: int = 900  # 15 minutes
    audio_max_age: int = 1800  # 30 minutes
    
    # Storage
    audio_storage_path: str = "./audio_files"
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

# Singleton instance
settings = Settings()
```

### Update code to use settings

**Before:**
```python
# Scattered throughout code
model = "llama-3.1-8b-instant"
max_tokens = 128
max_items = 4
```

**After:**
```python
from core.config import settings

# In llm_service.py
self.model = settings.llm_model
self.max_tokens = settings.llm_max_tokens

# In api_server.py
if user_request_counts[user_id] > settings.rate_limit_requests:
    ...

# In resume_query_processor.py
max_items = settings.max_display_items
```

### Update environment variables

Update `.env`:
```bash
# Required
GROQ_API_KEY=your_key_here

# Optional (has defaults)
DEBUG_MODE=false
LOG_LEVEL=INFO

# LLM Configuration
LLM_MODEL=llama-3.1-8b-instant
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=128
LLM_TIMEOUT=5.0

# Rate Limiting
RATE_LIMIT_REQUESTS=3
RATE_LIMIT_WINDOW=3600

# Audio
WHISPER_MODEL=base
MAX_AUDIO_DURATION=30
AUDIO_CLEANUP_INTERVAL=900
AUDIO_MAX_AGE=1800
```

---

## 🛡️ Day 4: Add Error Handling

### Create custom exceptions

Create `backend/core/errors.py`:
```python
"""Custom exception classes"""
from fastapi import HTTPException, status

class AppException(Exception):
    """Base exception for application errors"""
    def __init__(self, message: str, details: dict = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class AudioProcessingError(AppException):
    """Audio processing failed"""
    pass

class AudioTooShortError(AudioProcessingError):
    """Audio duration too short"""
    def __init__(self, duration: float, min_duration: float):
        super().__init__(
            f"Audio too short: {duration}s (minimum: {min_duration}s)",
            {"duration": duration, "min_duration": min_duration}
        )
        self.duration = duration
        self.min_duration = min_duration

class TranscriptionError(AudioProcessingError):
    """Speech transcription failed"""
    pass

class LLMError(AppException):
    """LLM processing failed"""
    pass

class RateLimitError(AppException):
    """Rate limit exceeded"""
    pass

# Exception handlers
async def app_exception_handler(request, exc: AppException):
    """Handle custom app exceptions"""
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail={
            "error": exc.__class__.__name__,
            "message": exc.message,
            "details": exc.details
        }
    )
```

### Add error handlers to FastAPI

Update `backend/api_server.py`:
```python
from core.errors import (
    AppException, AudioTooShortError, TranscriptionError,
    LLMError, RateLimitError, app_exception_handler
)

# Register exception handlers
app.add_exception_handler(AppException, app_exception_handler)

# Use in endpoints
@app.post("/process")
async def process_audio(...):
    try:
        # Check audio length
        if len(audio_data) < settings.sample_rate:  # Less than 1 second
            raise AudioTooShortError(
                duration=len(audio_data) / sample_rate,
                min_duration=1.0
            )
        
        # Transcribe
        transcription = transcribe_audio(audio_data)
        if not transcription.strip():
            raise TranscriptionError("No speech detected in audio")
        
        # Process with LLM
        try:
            response = await smart_query(smart_request)
        except Exception as e:
            logger.error("llm_processing_failed", error=str(e))
            raise LLMError(f"Language model processing failed: {str(e)}")
        
        return response
        
    except AudioTooShortError as e:
        logger.warning("audio_too_short", duration=e.duration)
        raise
    except TranscriptionError as e:
        logger.error("transcription_failed", error=str(e))
        raise
    except LLMError as e:
        logger.error("llm_error", error=str(e))
        raise
    except Exception as e:
        logger.exception("unexpected_error")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred"
        )
```

---

## 🚦 Day 5: Improve CORS & Security

### Update CORS configuration

**Before (insecure):**
```python
allow_origins=[
    "http://localhost:3000",
    "https://localhost:3000",
    "*"  # ❌ Too permissive
]
```

**After (secure):**
```python
from core.config import settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # Controlled by config
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Only what you need
    allow_headers=["*"],
    max_age=3600,  # Cache preflight for 1 hour
)
```

### Add API key authentication (optional but recommended)

Create `backend/core/auth.py`:
```python
"""Authentication utilities"""
from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from core.config import settings

# API Key header
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)):
    """Verify API key"""
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key missing"
        )
    
    # In production, check against database
    # For now, check against environment variable
    if api_key != settings.api_key:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key"
        )
    
    return api_key

# Usage in endpoints (optional - only if you want auth):
from core.auth import verify_api_key

@app.post("/process")
async def process_audio(
    audio_file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key)  # Add this
):
    ...
```

---

## 📊 Day 6: Add Health Check

### Create comprehensive health check

Create `backend/api/health.py`:
```python
"""Health check endpoints"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any
import time
import psutil
import os

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    timestamp: float
    version: str
    checks: Dict[str, Any]

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Basic health check"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0",
        "checks": {}
    }

@router.get("/health/detailed", response_model=HealthResponse)
async def detailed_health_check():
    """Detailed health check with system metrics"""
    
    checks = {}
    
    # Check LLM API
    try:
        from llm_service import ConversationManager
        manager = ConversationManager()
        checks["llm"] = {"status": "healthy", "model": manager.model}
    except Exception as e:
        checks["llm"] = {"status": "unhealthy", "error": str(e)}
    
    # Check disk space
    disk = psutil.disk_usage('/')
    checks["disk"] = {
        "status": "healthy" if disk.percent < 90 else "warning",
        "used_percent": disk.percent,
        "free_gb": disk.free / (1024**3)
    }
    
    # Check memory
    memory = psutil.virtual_memory()
    checks["memory"] = {
        "status": "healthy" if memory.percent < 90 else "warning",
        "used_percent": memory.percent,
        "available_gb": memory.available / (1024**3)
    }
    
    # Overall status
    overall_status = "healthy"
    if any(check.get("status") == "unhealthy" for check in checks.values()):
        overall_status = "unhealthy"
    elif any(check.get("status") == "warning" for check in checks.values()):
        overall_status = "warning"
    
    return {
        "status": overall_status,
        "timestamp": time.time(),
        "version": "1.0.0",
        "checks": checks
    }
```

### Include in main app

Update `backend/api_server.py`:
```python
from api import health

# Include health router
app.include_router(health.router, tags=["health"])
```

---

## 🧪 Day 7: Add Basic Tests

### Create test structure

```bash
mkdir -p backend/tests/unit
mkdir -p backend/tests/integration
```

Create `backend/tests/conftest.py`:
```python
"""Pytest configuration"""
import pytest
from fastapi.testclient import TestClient
from api_server import app

@pytest.fixture
def client():
    """Test client for FastAPI"""
    return TestClient(app)

@pytest.fixture
def sample_audio():
    """Sample audio data for testing"""
    import numpy as np
    duration = 2
    sample_rate = 16000
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    audio_data = np.sin(2 * np.pi * 440 * t) * 0.3
    return audio_data.astype(np.float32)
```

Create `backend/tests/unit/test_api.py`:
```python
"""Unit tests for API endpoints"""
import pytest
from fastapi.testclient import TestClient

def test_health_check(client: TestClient):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_session_creation(client: TestClient):
    """Test session creation"""
    response = client.post("/session/create")
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data

def test_text_validation(client: TestClient):
    """Test text input validation"""
    # Empty text should fail
    response = client.post(
        "/test/llm",
        json={"text": "", "session_id": "test"}
    )
    assert response.status_code == 422
    
    # Very long text should fail
    response = client.post(
        "/test/llm",
        json={"text": "a" * 1000, "session_id": "test"}
    )
    assert response.status_code == 422
    
    # Valid text should succeed
    response = client.post(
        "/test/llm",
        json={"text": "Tell me about projects", "session_id": "test"}
    )
    assert response.status_code == 200
```

### Run tests

```bash
cd backend
pip install pytest pytest-asyncio pytest-cov
pytest tests/ -v
pytest tests/ --cov=. --cov-report=html  # With coverage
```

---

## 📈 Day 8-14: Refactor Large Files

### Split resume_query_processor.py

This is a bigger task, but here's the structure:

```
backend/services/query/
├── __init__.py
├── processor.py           # Main orchestrator (200 lines)
├── intent.py              # Intent extraction (150 lines)
├── technology.py          # Tech matching (200 lines)
├── entity.py              # Entity detection (150 lines)
├── followup.py            # Follow-up handling (300 lines)
├── filters.py             # Date/tech filtering (200 lines)
├── guardrails.py          # Off-topic detection (150 lines)
└── response_generator.py  # Response formatting (100 lines)
```

### Example: Extract intent detection

Create `backend/services/query/intent.py`:
```python
"""Intent extraction for queries"""
import re
from typing import Dict, List

class IntentExtractor:
    """Extract user intent from queries"""
    
    def __init__(self):
        self.intent_patterns = {
            "projects": [
                r"(?i)projects?", r"(?i)built", r"(?i)created",
                r"(?i)developed", r"(?i)portfolio"
            ],
            "experience": [
                r"(?i)experience", r"(?i)worked at", r"(?i)companies?",
                r"(?i)jobs?", r"(?i)roles?"
            ],
            # ... other patterns
        }
    
    def extract(self, query: str) -> str:
        """Extract primary intent from query"""
        # Implementation moved from resume_query_processor
        ...
```

Create `backend/services/query/processor.py`:
```python
"""Main query processor orchestrator"""
from .intent import IntentExtractor
from .technology import TechnologyMatcher
from .entity import EntityDetector
from .followup import FollowupHandler
from .filters import QueryFilters
from .guardrails import Guardrails

class QueryProcessor:
    """Orchestrates query processing"""
    
    def __init__(self):
        self.intent_extractor = IntentExtractor()
        self.tech_matcher = TechnologyMatcher()
        self.entity_detector = EntityDetector()
        self.followup_handler = FollowupHandler()
        self.filters = QueryFilters()
        self.guardrails = Guardrails()
    
    def process(self, query: str, context: dict = None):
        """Process a query"""
        # Check guardrails
        if self.guardrails.is_off_topic(query):
            return self._off_topic_response()
        
        # Extract intent
        intent = self.intent_extractor.extract(query)
        
        # Check for followup
        if context and self.followup_handler.is_followup(query):
            return self.followup_handler.handle(query, context)
        
        # Rest of processing...
```

---

## 🎯 Summary Checklist

After 1-2 weeks, you should have:

- [ ] ✅ Replaced all `print()` with proper logging
- [ ] ✅ Added Pydantic validation on all endpoints
- [ ] ✅ Centralized configuration in `core/config.py`
- [ ] ✅ Created custom exception classes
- [ ] ✅ Improved CORS configuration
- [ ] ✅ Added health check endpoints
- [ ] ✅ Written basic tests (aim for 50%+ coverage)
- [ ] ✅ Started refactoring large files

---

## 🚀 Next Steps

After completing these quick wins:

1. **Set up Redis** for session management
2. **Add database layer** (PostgreSQL)
3. **Implement proper authentication**
4. **Move audio to S3**
5. **Add monitoring** (Prometheus/Grafana)

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Python Logging Best Practices](https://docs.python.org/3/howto/logging.html)
- [12-Factor App Methodology](https://12factor.net/)

---

*Start with Day 1 and work through each day's improvements. Each day builds on the previous one.*


