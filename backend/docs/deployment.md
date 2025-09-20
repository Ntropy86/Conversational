# Deployment Guide

This guide covers deployment strategies, configuration, and operational considerations for the Conversational AI Backend in production environments.

## Deployment Overview

The backend can be deployed in various configurations depending on your requirements:

- **Development**: Local development with hot reload
- **Staging**: Production-like environment for testing
- **Production**: High-availability, scalable deployment
- **Edge**: Distributed deployment for low latency

## Prerequisites

### System Requirements

#### Minimum Requirements:
- **CPU**: 2 cores, 2.4 GHz
- **RAM**: 4 GB
- **Storage**: 10 GB SSD
- **Network**: 100 Mbps

#### Recommended for Production:
- **CPU**: 4+ cores, 3.0+ GHz
- **RAM**: 8+ GB
- **Storage**: 50+ GB SSD
- **Network**: 1 Gbps

### Software Dependencies

#### Core Dependencies:
- Python 3.9+
- FFmpeg
- Git

#### Optional Dependencies:
- Docker & Docker Compose
- Nginx (reverse proxy)
- Redis (session storage)
- PostgreSQL (persistent storage)

## Local Development Deployment

### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd Conversational/backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development server
python api_server.py
```

The server will start on `http://localhost:8000` with auto-reload enabled.

### Development Configuration

Create `.env` file:
```env
# Development Configuration
GROQ_API_KEY=your_groq_api_key
ENVIRONMENT=development
DEBUG_MODE=true
LOG_LEVEL=DEBUG

# Audio Processing
WHISPER_MODEL_SIZE=base
VAD_THRESHOLD=0.8
MAX_AUDIO_LENGTH=30

# Cleanup Service
CLEANUP_INTERVAL=60
AUDIO_MAX_AGE=300

# Server Configuration
API_PORT=8000
RELOAD=true
```

### Hot Reload Setup

For development with auto-reload:
```bash
# Using uvicorn directly
uvicorn api_server:app --reload --host 0.0.0.0 --port 8000

# With environment variables
uvicorn api_server:app --reload --env-file .env
```

## Docker Deployment

### Single Container Deployment

#### Dockerfile
```dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Create necessary directories
RUN mkdir -p /app/audio_files /app/logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start application
CMD ["uvicorn", "api_server:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Build and Run
```bash
# Build image
docker build -t conversational-ai-backend .

# Run container
docker run -d \
  --name conversational-ai \
  -p 8000:8000 \
  --env-file .env \
  -v $(pwd)/audio_files:/app/audio_files \
  -v $(pwd)/logs:/app/logs \
  conversational-ai-backend
```

### Docker Compose Deployment

#### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:8000"
    environment:
      - GROQ_API_KEY=${GROQ_API_KEY}
      - ENVIRONMENT=production
      - DEBUG_MODE=false
      - REDIS_URL=redis://redis:6379
      - DATABASE_URL=postgresql://user:password@postgres:5432/conversational_ai
    volumes:
      - ./audio_files:/app/audio_files
      - ./logs:/app/logs
      - ./resume_data.json:/app/resume_data.json
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    command: redis-server --appendonly yes

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: conversational_ai
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  redis_data:
  postgres_data:
```

#### Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down
```

## Cloud Deployment

### AWS Deployment

#### EC2 Instance Setup
```bash
# Launch EC2 instance (Ubuntu 20.04 LTS)
# Configure Security Groups:
# - HTTP (80): 0.0.0.0/0
# - HTTPS (443): 0.0.0.0/0
# - Custom TCP (8000): 0.0.0.0/0 (or restrict to Load Balancer)
# - SSH (22): Your IP only

# Connect to instance
ssh -i your-key.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Clone and deploy
git clone <repository-url>
cd Conversational/backend
cp .env.example .env
# Configure .env file
docker-compose up -d
```

#### Application Load Balancer Configuration
```json
{
  "LoadBalancerArn": "arn:aws:elasticloadbalancing:region:account:loadbalancer/app/conversational-ai-lb/id",
  "Listeners": [
    {
      "Port": 80,
      "Protocol": "HTTP",
      "DefaultActions": [
        {
          "Type": "redirect",
          "RedirectConfig": {
            "Protocol": "HTTPS",
            "Port": "443",
            "StatusCode": "HTTP_301"
          }
        }
      ]
    },
    {
      "Port": 443,
      "Protocol": "HTTPS",
      "DefaultActions": [
        {
          "Type": "forward",
          "TargetGroupArn": "arn:aws:elasticloadbalancing:region:account:targetgroup/conversational-ai-tg/id"
        }
      ],
      "Certificates": [
        {
          "CertificateArn": "arn:aws:acm:region:account:certificate/certificate-id"
        }
      ]
    }
  ]
}
```

#### Auto Scaling Configuration
```bash
# Create Launch Template
aws ec2 create-launch-template \
  --launch-template-name conversational-ai-template \
  --launch-template-data '{
    "ImageId": "ami-0c02fb55956c7d316",
    "InstanceType": "t3.medium",
    "SecurityGroupIds": ["sg-xxxxxxxxx"],
    "UserData": "base64-encoded-startup-script"
  }'

# Create Auto Scaling Group
aws autoscaling create-auto-scaling-group \
  --auto-scaling-group-name conversational-ai-asg \
  --launch-template LaunchTemplateName=conversational-ai-template \
  --min-size 2 \
  --max-size 10 \
  --desired-capacity 2 \
  --target-group-arns arn:aws:elasticloadbalancing:region:account:targetgroup/conversational-ai-tg/id
```

### Google Cloud Platform

#### Compute Engine Deployment
```bash
# Create instance
gcloud compute instances create conversational-ai-instance \
  --zone=us-central1-a \
  --machine-type=e2-standard-2 \
  --image-family=ubuntu-2004-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=50GB \
  --tags=http-server,https-server

# Connect to instance
gcloud compute ssh conversational-ai-instance --zone=us-central1-a

# Install and deploy (same as EC2 steps above)
```

#### Cloud Run Deployment
```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/conversational-ai-backend', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/conversational-ai-backend']
  - name: 'gcr.io/cloud-builders/gcloud'
    args:
    - 'run'
    - 'deploy'
    - 'conversational-ai-backend'
    - '--image'
    - 'gcr.io/$PROJECT_ID/conversational-ai-backend'
    - '--region'
    - 'us-central1'
    - '--platform'
    - 'managed'
    - '--allow-unauthenticated'
```

```bash
# Deploy to Cloud Run
gcloud builds submit --config cloudbuild.yaml
```

### Azure Deployment

#### Container Instances
```bash
# Create resource group
az group create --name conversational-ai-rg --location eastus

# Create container instance
az container create \
  --resource-group conversational-ai-rg \
  --name conversational-ai-container \
  --image your-registry/conversational-ai-backend:latest \
  --cpu 2 \
  --memory 4 \
  --ports 8000 \
  --environment-variables \
    GROQ_API_KEY=your-api-key \
    ENVIRONMENT=production
```

#### App Service Deployment
```bash
# Create App Service Plan
az appservice plan create \
  --name conversational-ai-plan \
  --resource-group conversational-ai-rg \
  --sku B2 \
  --is-linux

# Create Web App
az webapp create \
  --resource-group conversational-ai-rg \
  --plan conversational-ai-plan \
  --name conversational-ai-app \
  --deployment-container-image-name your-registry/conversational-ai-backend:latest
```

## Production Configuration

### Environment Variables

#### Production .env
```env
# Production Configuration
GROQ_API_KEY=your_production_groq_api_key
ENVIRONMENT=production
DEBUG_MODE=false
LOG_LEVEL=INFO

# Security
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=yourdomain.com,api.yourdomain.com
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database (if using external storage)
REDIS_URL=redis://redis-cluster.cache.amazonaws.com:6379
DATABASE_URL=postgresql://user:password@rds-instance.amazonaws.com:5432/conversational_ai

# Performance
MAX_CONCURRENT_REQUESTS=20
WORKER_PROCESSES=4
WORKER_CONNECTIONS=1000

# Audio Processing
WHISPER_MODEL_SIZE=base  # or small for better performance
VAD_THRESHOLD=0.8
MAX_AUDIO_LENGTH=30
AUDIO_CLEANUP_INTERVAL=300  # 5 minutes
AUDIO_MAX_AGE=1800  # 30 minutes

# Monitoring
SENTRY_DSN=your-sentry-dsn
PROMETHEUS_ENABLED=true
METRICS_PORT=9090

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_BURST=10
```

### Nginx Configuration

#### nginx.conf
```nginx
upstream conversational_ai_backend {
    server backend1:8000 weight=3 max_fails=3 fail_timeout=30s;
    server backend2:8000 weight=2 max_fails=3 fail_timeout=30s;
    server backend3:8000 weight=1 max_fails=3 fail_timeout=30s;
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=60r/m;
limit_req_zone $binary_remote_addr zone=audio:10m rate=20r/m;

server {
    listen 80;
    server_name yourdomain.com api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain application/json application/javascript text/css;

    # API endpoints
    location / {
        limit_req zone=api burst=10 nodelay;
        
        proxy_pass http://conversational_ai_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Audio processing endpoint (stricter rate limiting)
    location /process {
        limit_req zone=audio burst=5 nodelay;
        
        proxy_pass http://conversational_ai_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Longer timeout for audio processing
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
        
        # Larger upload size for audio files
        client_max_body_size 25M;
    }

    # Audio file serving with caching
    location /audio/ {
        proxy_pass http://conversational_ai_backend;
        proxy_set_header Host $host;
        
        # Cache audio files
        proxy_cache audio_cache;
        proxy_cache_valid 200 5m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
        
        add_header X-Cache-Status $upstream_cache_status;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://conversational_ai_backend;
        access_log off;
    }

    # Metrics endpoint (restrict access)
    location /metrics {
        allow 10.0.0.0/8;
        allow 172.16.0.0/12;
        allow 192.168.0.0/16;
        deny all;
        
        proxy_pass http://conversational_ai_backend;
    }
}

# Cache configuration
proxy_cache_path /var/cache/nginx/audio levels=1:2 keys_zone=audio_cache:10m max_size=1g inactive=60m use_temp_path=off;
```

### SSL Certificate Setup

#### Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal setup
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### Application Monitoring

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'conversational-ai'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: '/metrics'
    scrape_interval: 10s
```

#### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Conversational AI Backend",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{endpoint}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph", 
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      }
    ]
  }
}
```

### Centralized Logging

#### ELK Stack Configuration
```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

#### Structured Logging Configuration
```python
# logging_config.py
import structlog
import logging.config

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "structured": {
            "()": structlog.stdlib.ProcessorFormatter,
            "processor": structlog.dev.ConsoleRenderer(),
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "structured",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "/app/logs/application.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
            "formatter": "structured",
        },
    },
    "loggers": {
        "": {
            "handlers": ["console", "file"],
            "level": "INFO",
        },
        "conversational_ai": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}

logging.config.dictConfig(LOGGING_CONFIG)
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)
```

## Security Configuration

### Application Security

#### API Key Management
```python
# secure_config.py
import os
from cryptography.fernet import Fernet

class SecureConfig:
    def __init__(self):
        self.encryption_key = os.getenv('ENCRYPTION_KEY')
        self.cipher_suite = Fernet(self.encryption_key)
    
    def encrypt_api_key(self, api_key: str) -> str:
        return self.cipher_suite.encrypt(api_key.encode()).decode()
    
    def decrypt_api_key(self, encrypted_key: str) -> str:
        return self.cipher_suite.decrypt(encrypted_key.encode()).decode()
```

#### Input Validation
```python
# validation.py
from pydantic import BaseModel, validator
from typing import Optional

class AudioProcessRequest(BaseModel):
    session_id: str
    max_duration: Optional[int] = 30
    
    @validator('session_id')
    def validate_session_id(cls, v):
        if not re.match(r'^[a-zA-Z0-9-_]{8,64}$', v):
            raise ValueError('Invalid session ID format')
        return v
    
    @validator('max_duration')
    def validate_duration(cls, v):
        if v and (v < 1 or v > 60):
            raise ValueError('Duration must be between 1 and 60 seconds')
        return v
```

### Infrastructure Security

#### Firewall Configuration
```bash
# UFW (Ubuntu Firewall) setup
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Fail2ban for SSH protection
sudo apt install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

#### Docker Security
```dockerfile
# Security-focused Dockerfile additions
FROM python:3.9-slim

# Run as non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Remove unnecessary packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set secure file permissions
COPY --chown=appuser:appuser . /app
RUN chmod -R 755 /app
RUN chmod -R 700 /app/logs

# Switch to non-root user
USER appuser

# Use HTTPS for package installation
ENV PIP_TRUSTED_HOST=pypi.org
ENV PIP_TRUSTED_HOST=pypi.python.org
ENV PIP_TRUSTED_HOST=files.pythonhosted.org
```

## Performance Optimization

### Application Performance

#### Async Optimization
```python
# async_optimization.py
import asyncio
from concurrent.futures import ThreadPoolExecutor

class PerformanceOptimizer:
    def __init__(self):
        self.thread_pool = ThreadPoolExecutor(max_workers=4)
    
    async def parallel_audio_processing(self, audio_file):
        # Run CPU-intensive tasks in thread pool
        loop = asyncio.get_event_loop()
        
        # Parallel execution of independent tasks
        vad_task = loop.run_in_executor(
            self.thread_pool, self.vad_service.detect_speech, audio_file
        )
        
        transcription_task = loop.run_in_executor(
            self.thread_pool, self.transcribe_service.transcribe, audio_file
        )
        
        # Wait for both to complete
        vad_result, transcription = await asyncio.gather(
            vad_task, transcription_task
        )
        
        return vad_result, transcription
```

#### Caching Strategy
```python
# caching.py
from functools import lru_cache
import redis
import json

class CacheManager:
    def __init__(self):
        self.redis_client = redis.Redis.from_url(os.getenv('REDIS_URL'))
    
    @lru_cache(maxsize=1000)
    def get_resume_content(self, content_type: str):
        """In-memory cache for frequently accessed content"""
        return self.load_content_from_file(content_type)
    
    async def cache_llm_response(self, query_hash: str, response: dict):
        """Cache LLM responses for similar queries"""
        await self.redis_client.setex(
            f"llm_response:{query_hash}",
            300,  # 5 minute TTL
            json.dumps(response)
        )
    
    async def get_cached_response(self, query_hash: str) -> Optional[dict]:
        cached = await self.redis_client.get(f"llm_response:{query_hash}")
        return json.loads(cached) if cached else None
```

### Database Optimization

#### Connection Pooling
```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=30,
    pool_recycle=3600,
    pool_pre_ping=True
)
```

## Backup and Recovery

### Automated Backups

#### Database Backup Script
```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/conversational-ai"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup PostgreSQL database
pg_dump $DATABASE_URL > "$BACKUP_DIR/database_$TIMESTAMP.sql"

# Backup resume content
cp resume_data.json "$BACKUP_DIR/resume_data_$TIMESTAMP.json"

# Backup configuration
cp .env "$BACKUP_DIR/env_$TIMESTAMP.backup"

# Compress backups
tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" \
    "$BACKUP_DIR/database_$TIMESTAMP.sql" \
    "$BACKUP_DIR/resume_data_$TIMESTAMP.json" \
    "$BACKUP_DIR/env_$TIMESTAMP.backup"

# Clean up individual files
rm "$BACKUP_DIR/database_$TIMESTAMP.sql" \
   "$BACKUP_DIR/resume_data_$TIMESTAMP.json" \
   "$BACKUP_DIR/env_$TIMESTAMP.backup"

# Remove backups older than 30 days
find "$BACKUP_DIR" -name "backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: backup_$TIMESTAMP.tar.gz"
```

#### Automated Backup Scheduling
```bash
# Add to crontab
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1

# Weekly backup to cloud storage
0 3 * * 0 /path/to/cloud_backup.sh
```

### Disaster Recovery

#### Recovery Procedures
```bash
#!/bin/bash
# recovery.sh

BACKUP_FILE=$1
RESTORE_DIR="/tmp/restore"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Extract backup
mkdir -p "$RESTORE_DIR"
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"

# Restore database
psql $DATABASE_URL < "$RESTORE_DIR/database_*.sql"

# Restore content
cp "$RESTORE_DIR/resume_data_*.json" resume_data.json

# Restore configuration (review before applying)
echo "Configuration backup available at: $RESTORE_DIR/env_*.backup"
echo "Please review and manually apply configuration changes"

# Clean up
rm -rf "$RESTORE_DIR"

echo "Recovery completed. Please restart the application."
```

This deployment guide provides comprehensive coverage of deployment strategies from development to production, including security, monitoring, and operational considerations for maintaining a robust conversational AI backend system.