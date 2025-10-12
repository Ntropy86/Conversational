# Architecture Comparison: Current vs. Proposed

## Current Architecture 🔴

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                     │
│              Deployed on Vercel/Netlify                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   api_server.py (673 lines)                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  - All routing logic                                 │    │
│  │  - Session management (in-memory dict)              │    │
│  │  - Rate limiting (in-memory dict)                   │    │
│  │  - Background tasks (in-memory dict)                │    │
│  │  - Business logic mixed with routing                │    │
│  │  - No proper error handling                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  Problems:                                                   │
│  ❌ Data lost on restart                                    │
│  ❌ Can't scale horizontally                                │
│  ❌ Single point of failure                                 │
│  ❌ No separation of concerns                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
┌───────────┐  ┌──────────────┐  ┌─────────────────┐
│llm_service│  │transcribe    │  │resume_query     │
│  .py      │  │_service.py   │  │_processor.py    │
│           │  │              │  │ (1895 lines!)   │
│ - Groq    │  │ - Whisper    │  │                 │
│ - 400     │  │ - faster-    │  │ - Too large     │
│   lines   │  │   whisper    │  │ - Monolithic    │
│           │  │              │  │ - Hard to test  │
└───────────┘  └──────────────┘  └─────────────────┘
        │              │              │
        │              │              │
        ▼              ▼              ▼
┌─────────────────────────────────────────────────┐
│         External Services (3rd Party)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  Groq    │  │ OpenAI   │  │  Edge    │      │
│  │  LLM     │  │ Whisper  │  │  TTS     │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│         Data Storage (Current)                  │
│  ┌──────────────┐  ┌─────────────┐             │
│  │ resume_data  │  │ Audio files │             │
│  │    .json     │  │ (local disk)│             │
│  │ (413 lines)  │  │ - temp files│             │
│  └──────────────┘  └─────────────┘             │
│                                                 │
│  Problems:                                      │
│  ❌ No database - just JSON files               │
│  ❌ Audio files pile up on disk                 │
│  ❌ No backup/recovery                          │
└─────────────────────────────────────────────────┘
```

---

## Proposed Architecture 🟢

```
┌──────────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                           │
│                   Deployed on Vercel                              │
└────────────────────────┬─────────────────────────────────────────┘
                         │ HTTPS/REST + WebSocket
                         │ (with API Key auth)
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│                    API Gateway Layer                              │
│  ┌────────────────────────────────────────────────────────┐      │
│  │  FastAPI Application (main.py) - Thin routing layer    │      │
│  │  - JWT/API Key authentication                          │      │
│  │  - Rate limiting (Redis-backed)                        │      │
│  │  - Request validation (Pydantic)                       │      │
│  │  - Structured logging                                  │      │
│  │  - Metrics collection                                  │      │
│  └────────────────────────────────────────────────────────┘      │
└────────────────────────┬─────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│   Routes    │  │  Middleware  │  │ Dependencies │
│             │  │              │  │              │
│ - /health   │  │ - Auth       │  │ - DB Session │
│ - /session  │  │ - CORS       │  │ - Redis      │
│ - /query    │  │ - Logging    │  │ - Services   │
│ - /audio    │  │ - Errors     │  │ - Config     │
└─────────────┘  └──────────────┘  └──────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│   LLM       │  │   Audio      │  │   Query      │
│  Service    │  │  Processing  │  │  Processing  │
│             │  │              │  │              │
│ - Convo     │  │ - Transcribe │  │ - Intent     │
│   Manager   │  │ - TTS        │  │ - Filter     │
│ - Prompts   │  │ - VAD        │  │ - Guardrails │
│ - Streaming │  │              │  │ - Followup   │
└─────────────┘  └──────────────┘  └──────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│  PostgreSQL │  │    Redis     │  │    AWS S3    │
│             │  │              │  │              │
│ - Sessions  │  │ - Cache      │  │ - Audio      │
│ - Users     │  │ - Rate Limit │  │   Files      │
│ - History   │  │ - Jobs Queue │  │ - Backups    │
│ - Content   │  │              │  │              │
└─────────────┘  └──────────────┘  └──────────────┘
         │               │               │
         └───────────────┼───────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌──────────────┐  ┌──────────────┐
│   Groq      │  │   OpenAI     │  │   Edge       │
│   LLM API   │  │  Whisper API │  │   TTS API    │
└─────────────┘  └──────────────┘  └──────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                 Observability & Monitoring                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐  │
│  │ Prometheus │  │  Grafana   │  │   Sentry   │  │   Logs    │  │
│  │  Metrics   │  │ Dashboards │  │   Errors   │  │ (CloudWatch│ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Detailed Service Layer Architecture

### Current Services (Monolithic)

```
resume_query_processor.py (1895 lines)
├── Intent extraction
├── Technology matching
├── Entity detection
├── Followup handling
├── Date filtering
├── Guardrails
├── Response generation
└── All mixed together ❌
```

### Proposed Services (Modular)

```
services/
├── llm/
│   ├── conversation_manager.py    # Manages chat state
│   ├── prompt_manager.py          # Loads & formats prompts
│   ├── response_parser.py         # Parses structured responses
│   └── streaming.py               # Handles streaming responses
│
├── audio/
│   ├── transcription.py           # Whisper integration
│   ├── synthesis.py               # TTS integration
│   ├── vad.py                     # Voice activity detection
│   └── preprocessing.py           # Audio cleanup/normalization
│
├── query/
│   ├── processor.py               # Main orchestrator
│   ├── intent_extractor.py        # Intent classification
│   ├── technology_matcher.py      # Tech filtering & similarity
│   ├── entity_detector.py         # Company/project detection
│   ├── followup_handler.py        # Context-aware followups
│   ├── date_filter.py             # Date range filtering
│   ├── guardrails.py              # Off-topic detection
│   └── response_generator.py      # Format responses
│
├── content/
│   ├── repository.py              # Data access layer
│   ├── search.py                  # Search & indexing
│   └── cache.py                   # Caching layer
│
└── storage/
    ├── session_store.py           # Redis session management
    ├── audio_store.py             # S3 audio storage
    └── database.py                # PostgreSQL operations
```

---

## Data Flow Comparison

### Current Data Flow

```
User Request
    │
    ▼
api_server.py (Everything happens here)
    ├── Parse request
    ├── Check in-memory rate limit
    ├── Load JSON file
    ├── Process query (1895 line function)
    ├── Call LLM
    ├── Generate TTS
    ├── Save audio to disk
    └── Return response
    
⏱️  Total: 2-4 seconds
❌  Can't scale
❌  Lost on restart
```

### Proposed Data Flow

```
User Request
    │
    ▼
API Gateway
    ├── Authenticate (JWT)
    ├── Validate (Pydantic)
    ├── Check rate limit (Redis)
    └── Route to handler
    │
    ▼
Service Layer (Parallel Processing)
    ├── Query Service
    │   ├── Extract intent
    │   ├── Check cache (Redis)
    │   ├── Query database (PostgreSQL)
    │   └── Filter & rank results
    │
    ├── LLM Service
    │   ├── Load prompt template
    │   ├── Format with context
    │   ├── Call Groq API
    │   └── Parse response
    │
    └── Audio Service (If needed)
        ├── Transcribe (Whisper)
        ├── Generate speech (Edge TTS)
        └── Upload to S3
    │
    ▼
Response
    ├── Cache result (Redis)
    ├── Save to history (PostgreSQL)
    ├── Log metrics (Prometheus)
    └── Return to client

⏱️  Total: 1-2 seconds (with caching)
✅  Scales horizontally
✅  Persists across restarts
✅  Fault tolerant
```

---

## Storage Comparison

### Current Storage

```
┌──────────────────────────────────────┐
│       Local Filesystem               │
├──────────────────────────────────────┤
│  resume_data.json (413 lines)        │
│  - Loaded on every request           │
│  - No indexing                       │
│  - No querying                       │
│                                      │
│  Audio Files (temp_*.wav)            │
│  - Scattered on disk                 │
│  - Manual cleanup required           │
│  - No CDN                            │
│                                      │
│  In-Memory Dicts                     │
│  - conversations = {}                │
│  - background_tasks = {}             │
│  - user_request_counts = {}          │
│  - Lost on restart                   │
└──────────────────────────────────────┘

Problems:
❌ No persistence
❌ No backup
❌ Can't scale
❌ Slow queries
❌ Manual cleanup
```

### Proposed Storage

```
┌────────────────────────────────────────────────────────────┐
│                     PostgreSQL                             │
├────────────────────────────────────────────────────────────┤
│  users                                                     │
│  - id, email, api_key, created_at                         │
│                                                            │
│  sessions                                                  │
│  - id, user_id, started_at, last_active                   │
│                                                            │
│  conversations                                             │
│  - id, session_id, role, message, timestamp               │
│                                                            │
│  content (Indexed)                                         │
│  - id, type, title, description, technologies[]           │
│  - Full-text search enabled                               │
│  - Indexed by technology, date, keywords                  │
│                                                            │
│  analytics                                                 │
│  - query, intent, items_shown, response_time             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                       Redis                                │
├────────────────────────────────────────────────────────────┤
│  Session Cache (TTL: 1 hour)                              │
│  session:{session_id} → {conversation_state}              │
│                                                            │
│  Rate Limiting (TTL: 1 hour)                              │
│  rate_limit:{user_id}:{window} → count                    │
│                                                            │
│  Query Cache (TTL: 5 minutes)                             │
│  query:{hash} → {response}                                 │
│                                                            │
│  Background Jobs Queue                                     │
│  jobs:pending → [job_id, job_id, ...]                     │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                       AWS S3                               │
├────────────────────────────────────────────────────────────┤
│  Bucket: audio-files                                       │
│  - /transcriptions/{session_id}/{file_id}.wav             │
│  - /responses/{session_id}/{file_id}.wav                  │
│                                                            │
│  Lifecycle Policy:                                         │
│  - Delete after 24 hours                                   │
│                                                            │
│  Benefits:                                                 │
│  - Pre-signed URLs (secure)                               │
│  - CDN integration (fast)                                  │
│  - Automatic cleanup                                       │
│  - Versioning & backup                                     │
└────────────────────────────────────────────────────────────┘

Benefits:
✅ Persistent storage
✅ Automatic backups
✅ Scales horizontally
✅ Fast queries with indexes
✅ Automatic cleanup
```

---

## Deployment Comparison

### Current Deployment

```
┌─────────────────────────────────┐
│    Single EC2 Instance          │
│                                 │
│  python api_server.py           │
│                                 │
│  Problems:                      │
│  ❌ Single point of failure     │
│  ❌ No load balancing           │
│  ❌ Manual scaling              │
│  ❌ No health checks            │
│  ❌ No auto-restart             │
└─────────────────────────────────┘
```

### Proposed Deployment

```
┌──────────────────────────────────────────────────────────┐
│                  AWS/Cloud Provider                      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │      Application Load Balancer             │         │
│  │  - Health checks                           │         │
│  │  - SSL termination                         │         │
│  │  - Request routing                         │         │
│  └─────────┬──────────────┬──────────────────┘         │
│            │              │                             │
│  ┌─────────▼───┐  ┌──────▼──────┐  ┌──────────┐       │
│  │   API       │  │   API       │  │   API    │       │
│  │ Instance 1  │  │ Instance 2  │  │Instance N│       │
│  │             │  │             │  │          │       │
│  │ Auto-scaling Group                         │       │
│  │ - Min: 2 instances                         │       │
│  │ - Max: 10 instances                        │       │
│  │ - Scale on CPU/Memory/Request count        │       │
│  └─────────┬──────────────┬──────────────────┘         │
│            │              │                             │
│  ┌─────────▼──────────────▼──────────────────┐         │
│  │           Shared Services                  │         │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐│         │
│  │  │PostgreSQL│  │  Redis   │  │    S3    ││         │
│  │  │  RDS     │  │ElastiCache│ │  Bucket  ││         │
│  │  └──────────┘  └──────────┘  └──────────┘│         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │         Monitoring & Logging               │         │
│  │  - CloudWatch (logs, metrics, alarms)      │         │
│  │  - X-Ray (tracing)                         │         │
│  │  - SNS (alerts)                            │         │
│  └────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────┘

Benefits:
✅ High availability (99.9%+)
✅ Auto-scaling
✅ Zero-downtime deploys
✅ Disaster recovery
✅ Monitoring & alerts
```

---

## Cost Comparison

### Current Setup Cost (Monthly)

| Resource | Cost | Notes |
|----------|------|-------|
| EC2 t3.medium | $30 | Single instance |
| Storage (50GB) | $5 | EBS volume |
| Groq API | $10-50 | Usage-based |
| Edge TTS | Free | Microsoft service |
| **Total** | **$45-85** | No redundancy |

### Proposed Setup Cost (Monthly)

| Resource | Cost | Notes |
|----------|------|-------|
| EC2 (2x t3.medium) | $60 | Auto-scaling |
| Load Balancer | $20 | Application LB |
| RDS PostgreSQL (db.t3.micro) | $15 | 20GB storage |
| ElastiCache Redis (cache.t3.micro) | $13 | 1GB memory |
| S3 + CloudFront | $5-15 | Audio + CDN |
| Groq API | $10-50 | Usage-based |
| Monitoring (CloudWatch) | $10 | Logs + metrics |
| **Total** | **$133-183** | Production-ready |

**ROI:**
- 3x cost but 10x better reliability
- Can handle 10x more traffic
- 99.9% uptime vs 95% uptime
- Worth it for production use

---

## Migration Path

```
┌──────────────────────────────────────────────────────────┐
│                  Phase 1: Foundation (Week 1-2)          │
├──────────────────────────────────────────────────────────┤
│  ✓ Add logging                                           │
│  ✓ Add input validation                                  │
│  ✓ Centralize configuration                              │
│  ✓ Add error handling                                    │
│  ✓ Write tests                                           │
│  ✓ Fix CORS                                              │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│            Phase 2: Storage Layer (Week 3-4)             │
├──────────────────────────────────────────────────────────┤
│  ✓ Set up PostgreSQL                                     │
│  ✓ Migrate resume_data.json → database                   │
│  ✓ Set up Redis                                          │
│  ✓ Migrate sessions → Redis                              │
│  ✓ Set up S3                                             │
│  ✓ Migrate audio → S3                                    │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│          Phase 3: Refactor Services (Week 5-6)           │
├──────────────────────────────────────────────────────────┤
│  ✓ Split resume_query_processor                          │
│  ✓ Extract service layer                                 │
│  ✓ Add caching layer                                     │
│  ✓ Implement dependency injection                        │
└──────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────┐
│       Phase 4: Deployment & Monitoring (Week 7-8)        │
├──────────────────────────────────────────────────────────┤
│  ✓ Set up CI/CD pipeline                                 │
│  ✓ Add monitoring (Prometheus/Grafana)                   │
│  ✓ Configure auto-scaling                                │
│  ✓ Load testing                                          │
│  ✓ Production deployment                                 │
└──────────────────────────────────────────────────────────┘
```

---

## Summary

| Aspect | Current | Proposed | Improvement |
|--------|---------|----------|-------------|
| **Scalability** | ❌ Single instance | ✅ Auto-scaling | 10x capacity |
| **Reliability** | ❌ 95% uptime | ✅ 99.9% uptime | 20x better |
| **Data Persistence** | ❌ In-memory | ✅ PostgreSQL | Permanent |
| **Code Quality** | ⚠️ Monolithic | ✅ Modular | 5x maintainable |
| **Performance** | ⚠️ 2-4s response | ✅ 1-2s response | 2x faster |
| **Security** | ❌ None | ✅ Auth + Rate limit | Production-ready |
| **Observability** | ❌ Print logs | ✅ Full monitoring | Debuggable |
| **Cost** | $45-85/mo | $133-183/mo | 3x cost |

**Verdict:** The proposed architecture is **essential for production** despite higher cost.

---

*Architecture comparison v1.0 - October 2025*


