# Backend Environment Setup Guide

This guide will help you set up the complete Conversational AI Backend environment with all required dependencies and services.

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Navigate to backend directory
cd backend

# Run the automated setup script
./setup.sh

# Edit .env file with your API keys
nano .env

# Start the backend server
./start.sh
```

### Option 2: Manual Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp env.example .env

# Edit .env file with your API keys
nano .env

# Start the server
python api_server.py
```

## Prerequisites

### System Requirements
- **Python 3.9+** (required for PyTorch and modern ML libraries)
- **FFmpeg** (for audio processing)
- **8GB+ RAM** (recommended for ML models)
- **2GB+ free disk space** (for model downloads)

### API Keys Required
- **Groq API Key**: Get from [Groq Console](https://console.groq.com/)
- **ElevenLabs API Key**: Get from [ElevenLabs](https://elevenlabs.io/)

## Detailed Setup Instructions

### 1. System Dependencies

#### Ubuntu/Debian:
```bash
sudo apt-get update
sudo apt-get install -y python3.9 python3.9-venv python3-pip ffmpeg
```

#### macOS:
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install python@3.9 ffmpeg
```

#### Windows:
```bash
# Install Python 3.9+ from python.org
# Install FFmpeg from https://ffmpeg.org/download.html
# Or use Chocolatey:
choco install python ffmpeg
```

### 2. Python Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/macOS:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Upgrade pip
pip install --upgrade pip
```

### 3. Install Dependencies

```bash
# Install production dependencies
pip install -r requirements.txt

# For development (optional)
pip install -r requirements-dev.txt
```

### 4. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env file
nano .env  # or use your preferred editor
```

Required environment variables:
```env
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

Optional configuration:
```env
WHISPER_MODEL_SIZE=base          # tiny, base, small, medium, large
VAD_THRESHOLD=0.8                # Voice activity detection threshold
TTS_VOICE=en-US-AriaNeural       # TTS voice selection
API_PORT=8000                    # Server port
DEBUG_MODE=false                 # Enable debug logging
MAX_AUDIO_LENGTH=30              # Maximum audio length in seconds
CLEANUP_INTERVAL=15              # Audio cleanup interval in seconds
AUDIO_MAX_AGE=30                 # Audio file max age in seconds
```

### 5. Verify Installation

```bash
# Test the installation
python test_backend.py

# Or test individual components
python test_individual.py
```

## Running the Backend

### Development Mode
```bash
# Using the start script
./start.sh --dev

# Or directly with uvicorn
uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
```

### Production Mode
```bash
# Using the start script
./start.sh --prod

# Or directly with uvicorn
uvicorn api_server:app --host 0.0.0.0 --port 8000
```

### Using Docker
```bash
# Build the Docker image
docker build -t conversational-ai-backend .

# Run with environment variables
docker run -p 8000:8000 --env-file .env conversational-ai-backend

# Or use docker-compose
docker-compose up -d
```

## Testing the Backend

### 1. Health Check
```bash
curl http://localhost:8000/
```

### 2. API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 3. Test Individual Components
```bash
# Test LLM service
python test_individual.py llm --text "Tell me about your projects"

# Test TTS service
python test_individual.py tts --text "Hello world"

# Test transcription
python test_individual.py transcribe --audio test_audio.wav

# Test full pipeline
python test_individual.py full --audio test_audio.wav
```

### 4. Comprehensive Testing
```bash
# Run all tests
python test_backend.py
```

## Troubleshooting

### Common Issues

#### 1. "Module not found" errors
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### 2. "GROQ_API_KEY not found"
```bash
# Check .env file exists and has correct key
cat .env | grep GROQ_API_KEY

# If missing, add to .env file
echo "GROQ_API_KEY=your_key_here" >> .env
```

#### 3. "FFmpeg not found"
```bash
# Install FFmpeg
# Ubuntu/Debian:
sudo apt-get install ffmpeg

# macOS:
brew install ffmpeg

# Windows: Download from https://ffmpeg.org/
```

#### 4. "Out of memory" errors
```bash
# Use smaller Whisper model
export WHISPER_MODEL_SIZE=tiny

# Or reduce audio processing
export MAX_AUDIO_LENGTH=10
```

#### 5. Slow performance
```bash
# Use smaller models
export WHISPER_MODEL_SIZE=base
export VAD_THRESHOLD=0.9

# Enable debug mode to see timing
export DEBUG_MODE=true
```

### Performance Optimization

#### Model Selection
- **tiny**: Fastest, lowest accuracy (~39MB)
- **base**: Balanced speed/accuracy (~74MB) - **Recommended**
- **small**: Better accuracy, slower (~244MB)
- **medium**: High accuracy, slow (~769MB)
- **large**: Best accuracy, slowest (~1550MB)

#### Memory Usage
- **tiny**: ~1GB RAM
- **base**: ~2GB RAM
- **small**: ~4GB RAM
- **medium**: ~8GB RAM
- **large**: ~16GB RAM

## Development

### Code Quality
```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run code formatting
black .
isort .

# Run linting
flake8 .

# Run type checking
mypy .

# Run tests
pytest
```

### Pre-commit Hooks
```bash
# Install pre-commit hooks
pre-commit install

# Run hooks manually
pre-commit run --all-files
```

## Deployment

### Docker Deployment
```bash
# Build image
docker build -t conversational-ai-backend .

# Run container
docker run -d \
  --name conversational-ai \
  -p 8000:8000 \
  --env-file .env \
  conversational-ai-backend
```

### Docker Compose
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Considerations
- Use a reverse proxy (nginx/Apache)
- Set up SSL/TLS certificates
- Configure proper logging
- Set up monitoring and alerting
- Use environment-specific configurations
- Implement proper backup strategies

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the logs: `tail -f logs/app.log`
3. Test individual components: `python test_individual.py`
4. Check API documentation: http://localhost:8000/docs
5. Verify environment variables: `python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('GROQ_API_KEY:', bool(os.getenv('GROQ_API_KEY')))"`

## Next Steps

After successful setup:

1. **Test the API**: Visit http://localhost:8000/docs
2. **Integrate with Frontend**: Update frontend API endpoints
3. **Configure Production**: Set up proper environment variables
4. **Monitor Performance**: Use the built-in timing metrics
5. **Scale as Needed**: Consider load balancing for high traffic

---

**Happy coding!** 🚀
