# Conversational AI Backend - Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Conversational AI Backend.

## Quick Diagnosis

### System Health Check
```bash
# Check if all services are running
curl http://localhost:8000/health

# Check detailed component status
curl http://localhost:8000/health/detailed

# Verify API connectivity
curl -X POST http://localhost:8000/session/create
```

### Log Analysis
```bash
# View recent logs
tail -f logs/application.log

# Search for errors
grep -i error logs/application.log | tail -20

# Check memory usage
grep -i "memory\|ram\|oom" logs/application.log
```

## Common Issues and Solutions

### 1. "GROQ_API_KEY not found" Error

#### Symptoms:
- 500 Internal Server Error on LLM requests
- Log message: "GROQ_API_KEY environment variable not found"

#### Solutions:
```bash
# Check if .env file exists
ls -la .env

# Verify API key is set
grep GROQ_API_KEY .env

# If missing, add to .env file
echo "GROQ_API_KEY=your_actual_api_key" >> .env

# Restart the application
python api_server.py
```

### 2. Audio Processing Failures

#### Symptoms:
- "Audio processing failed" errors
- Timeouts on /process endpoint
- Poor transcription quality

#### Diagnosis:
```python
# Test audio processing components individually
python -c "
from transcribe_service import transcribe_audio
from vad_service import detect_speech
from tts_service import generate_speech

# Test with a sample audio file
try:
    result = transcribe_audio('test_audio.wav')
    print(f'Transcription successful: {result}')
except Exception as e:
    print(f'Transcription failed: {e}')
"
```

#### Solutions:

**For Whisper Model Issues:**
```bash
# Clear model cache and re-download
rm -rf ~/.cache/whisper/

# Test model loading
python -c "
from faster_whisper import WhisperModel
model = WhisperModel('base')
print('Model loaded successfully')
"

# Try smaller model for testing
export WHISPER_MODEL_SIZE=tiny
```

**For Audio Format Issues:**
```bash
# Install/update FFmpeg
# Ubuntu/Debian:
sudo apt update && sudo apt install ffmpeg

# macOS:
brew install ffmpeg

# Test audio conversion
ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav
```

**For Memory Issues:**
```bash
# Check available memory
free -h

# Monitor memory usage during processing
watch -n 1 'ps aux | grep python | head -5'

# Reduce memory usage
export WHISPER_MODEL_SIZE=tiny
export MAX_CONCURRENT_REQUESTS=2
```

### 3. TTS (Text-to-Speech) Failures

#### Symptoms:
- No audio response generated
- "TTS synthesis failed" errors
- Empty or corrupted audio files

#### Solutions:
```bash
# Test TTS service directly
curl -X POST http://localhost:8000/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test", "voice": "en-US-AriaNeural"}'

# Check available voices
python -c "
import asyncio
from edge_tts import list_voices

async def check_voices():
    voices = await list_voices()
    print(f'Available voices: {len(voices)}')
    for voice in voices[:5]:
        print(f'- {voice[\"Name\"]}: {voice[\"DisplayName\"]}')

asyncio.run(check_voices())
"

# Test with different voice
curl -X POST http://localhost:8000/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "Test", "voice": "en-US-JennyNeural"}'
```

### 4. Session Management Issues

#### Symptoms:
- "Session not found" errors
- Session data not persisting
- Memory leaks from old sessions

#### Solutions:
```bash
# Check session storage
curl http://localhost:8000/debug/sessions  # If debug mode enabled

# Test session creation
SESSION_ID=$(curl -s -X POST http://localhost:8000/session/create | jq -r .session_id)
echo "Created session: $SESSION_ID"

# Verify session exists
curl http://localhost:8000/session/$SESSION_ID

# Clean up old sessions manually
curl -X DELETE http://localhost:8000/session/$SESSION_ID
```

### 5. High Memory Usage

#### Symptoms:
- Application becomes slow over time
- Out of memory errors
- Server crashes under load

#### Diagnosis:
```python
# Memory profiling script
import psutil
import os

process = psutil.Process(os.getpid())
memory_info = process.memory_info()
print(f"Memory usage: {memory_info.rss / 1024 / 1024:.1f} MB")
print(f"Memory percent: {process.memory_percent():.1f}%")

# Check for memory leaks
import gc
print(f"Garbage collector objects: {len(gc.get_objects())}")
```

#### Solutions:
```bash
# Monitor memory usage
watch -n 5 'free -h && echo "---" && ps aux | grep python | head -3'

# Restart application periodically (temporary fix)
# Add to crontab: 0 */6 * * * systemctl restart conversational-ai

# Reduce memory footprint
export WHISPER_MODEL_SIZE=tiny
export MAX_AUDIO_LENGTH=15
export CLEANUP_INTERVAL=30
export AUDIO_MAX_AGE=60
```

### 6. Slow Response Times

#### Symptoms:
- API requests taking >10 seconds
- Timeouts in frontend
- Poor user experience

#### Diagnosis:
```bash
# Test response times
time curl -X POST http://localhost:8000/process \
  -F "audio_file=@test_audio.wav" \
  -F "session_id=test-session"

# Profile individual components
python scripts/performance_test.py http://localhost:8000/health
```

#### Solutions:

**Model Optimization:**
```bash
# Use smaller, faster models
export WHISPER_MODEL_SIZE=tiny  # Instead of base/small
export VAD_THRESHOLD=0.6        # More sensitive, faster detection

# Enable GPU if available
python -c "
import torch
print(f'CUDA available: {torch.cuda.is_available()}')
if torch.cuda.is_available():
    print(f'GPU: {torch.cuda.get_device_name(0)}')
"
```

**Concurrency Optimization:**
```bash
# Increase worker processes
export WORKERS=4
export MAX_CONCURRENT_REQUESTS=20

# Use async processing
export ENABLE_ASYNC_PROCESSING=true
```

**Caching:**
```python
# Enable Redis caching
export REDIS_URL=redis://localhost:6379
export ENABLE_RESPONSE_CACHING=true
export CACHE_TTL=300  # 5 minutes
```

### 7. File Storage Issues

#### Symptoms:
- "Audio file not found" errors
- Disk space running out
- Old files not being cleaned up

#### Solutions:
```bash
# Check disk usage
df -h
du -sh audio_files/

# Manual cleanup
find audio_files/ -name "*.wav" -mtime +1 -delete

# Check cleanup service
curl http://localhost:8000/debug/cleanup  # If debug mode enabled

# Verify cleanup configuration
grep -E "CLEANUP|AUDIO_MAX_AGE" .env
```

### 8. Network and Connectivity Issues

#### Symptoms:
- "Connection refused" errors
- Timeouts to external APIs
- CORS errors from frontend

#### Solutions:

**API Connectivity:**
```bash
# Test external API access
curl -I https://api.groq.com/

# Check DNS resolution
nslookup api.groq.com

# Test from application context
python -c "
import requests
response = requests.get('https://httpbin.org/get', timeout=10)
print(f'Status: {response.status_code}')
"
```

**CORS Configuration:**
```bash
# Check CORS settings
grep CORS .env

# Test CORS from browser console
fetch('http://localhost:8000/health', {
  method: 'GET',
  mode: 'cors'
}).then(r => console.log(r.status))

# Update CORS origins
export CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

**Firewall Issues:**
```bash
# Check if port is open
netstat -tlnp | grep :8000

# Test port accessibility
telnet localhost 8000

# Ubuntu firewall
sudo ufw status
sudo ufw allow 8000/tcp
```

## Performance Monitoring

### Real-time Monitoring
```bash
# Monitor system resources
htop

# Monitor network connections
netstat -tupln | grep :8000

# Monitor disk I/O
iotop

# Monitor application logs
tail -f logs/application.log | grep -E "(ERROR|WARNING|SLOW)"
```

### Metrics Collection
```python
# Custom monitoring script
import requests
import time
import json

def monitor_endpoint(url, interval=30):
    """Monitor endpoint performance"""
    while True:
        start_time = time.time()
        try:
            response = requests.get(url, timeout=10)
            response_time = time.time() - start_time
            
            print(json.dumps({
                "timestamp": time.time(),
                "url": url,
                "status_code": response.status_code,
                "response_time": response_time,
                "success": response.status_code == 200
            }))
            
        except Exception as e:
            print(json.dumps({
                "timestamp": time.time(),
                "url": url,
                "error": str(e),
                "success": False
            }))
        
        time.sleep(interval)

if __name__ == "__main__":
    monitor_endpoint("http://localhost:8000/health")
```

## Advanced Debugging

### Enable Debug Mode
```bash
# Enable comprehensive debugging
export DEBUG_MODE=true
export LOG_LEVEL=DEBUG

# Restart application
python api_server.py
```

### Debug Endpoints (Development Only)
```bash
# Session debugging
curl http://localhost:8000/debug/session/test-session-id

# Model status
curl http://localhost:8000/debug/models

# Memory usage
curl http://localhost:8000/debug/memory

# Configuration
curl http://localhost:8000/debug/config
```

### Profiling
```python
# Profile memory usage
python -m memory_profiler api_server.py

# Profile CPU usage
python -m py_spy top --pid $(pgrep -f api_server.py)

# Profile specific function
python -c "
import cProfile
import pstats
from api_server import app

# Profile a test request
cProfile.run('app.test_client().get(\"/health\")', 'profile_stats')
stats = pstats.Stats('profile_stats')
stats.sort_stats('cumulative').print_stats(10)
"
```

## Getting Help

### Log Collection for Support
```bash
# Collect diagnostic information
echo "=== System Information ===" > debug_info.txt
uname -a >> debug_info.txt
python --version >> debug_info.txt
pip list >> debug_info.txt

echo "=== Configuration ===" >> debug_info.txt
cat .env | grep -v API_KEY >> debug_info.txt

echo "=== Recent Logs ===" >> debug_info.txt  
tail -100 logs/application.log >> debug_info.txt

echo "=== System Resources ===" >> debug_info.txt
free -h >> debug_info.txt
df -h >> debug_info.txt

echo "=== Network Status ===" >> debug_info.txt
netstat -tlnp | grep :8000 >> debug_info.txt
```

### Community Support
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Check the docs/ directory for detailed guides
- **Stack Overflow**: Use tags `conversational-ai`, `fastapi`, `whisper`

### Professional Support
For production deployments requiring professional support:
- Performance optimization consulting
- Custom feature development
- 24/7 monitoring and maintenance
- Security audits and compliance

Contact: [your-support-email@domain.com]

## Prevention Strategies

### Regular Maintenance
```bash
# Daily checks (add to cron)
0 9 * * * /path/to/health_check.sh

# Weekly cleanup
0 3 * * 0 /path/to/weekly_maintenance.sh

# Monthly log rotation
0 2 1 * * /path/to/log_rotation.sh
```

### Monitoring Alerts
Set up alerts for:
- Error rate > 5%
- Response time > 5 seconds
- Memory usage > 80%
- Disk space < 20%
- Service downtime

### Backup Strategy
```bash
# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR

# Backup configuration
cp .env $BACKUP_DIR/
cp resume_data.json $BACKUP_DIR/

# Backup logs
cp -r logs/ $BACKUP_DIR/

# Create archive
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR/
rm -rf $BACKUP_DIR/

echo "Backup completed: $BACKUP_DIR.tar.gz"
```

This troubleshooting guide provides comprehensive solutions for common issues and advanced debugging techniques to keep your conversational AI backend running smoothly.