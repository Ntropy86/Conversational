# api_server.py
import os
import tempfile
import numpy as np
import soundfile as sf
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import uvicorn
from pydantic import BaseModel
import uuid
import time
import re
import asyncio

# Import your existing components
# from vad_service import record_until_silence  # Not needed for web API
from audio_cleanup import init_cleanup_service, cleanup_audio_file, mark_audio_active, mark_audio_inactive
from transcribe_service import transcribe_audio
from llm_service import ConversationManager
from tts_service import generate_speech_async  # Use the async version directly
from resume_query_processor import ResumeQueryProcessor

# Import new database services
from guestbook_api import router as guestbook_router
from ai_session_logger import start_ai_session, log_ai_interaction, get_ai_session_stats, end_ai_session, ai_logger
from database_service import db_service

app = FastAPI(title="AI Assistant API")

# Include guestbook router
app.include_router(guestbook_router, prefix="/api", tags=["guestbook"])

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development
        "https://localhost:3000",
        "https://*.vercel.app",   # Your Vercel frontend
        "https://vercel.app",
        "*"  # Fallback - you can remove this once you know your exact Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize audio cleanup service
@app.on_event("startup")
async def startup_event():
    init_cleanup_service()
    print("🧹 Audio cleanup service started")
    
    # Start AI session logging
    try:
        print(f"🔍 Database connected: {db_service.is_connected()}")
        session_id = start_ai_session()
        print(f"🤖 AI session logging started: {session_id}")
        print(f"🔍 AI logger current session: {ai_logger.current_session_id}")
    except Exception as e:
        print(f"⚠️ AI session logging not available: {e}")

# Store conversations by session ID
conversations = {}

class TextRequest(BaseModel):
    text: str
    session_id: str = None
    conversation_history: list = []

class SessionRequest(BaseModel):
    session_id: str

def is_complete(text):
    """Check if a text chunk is a complete sentence"""
    return bool(re.search(r"[.!?][\"']?$", text.strip()))

@app.get("/")
async def root():
    return {"message": "AI Assistant API is running"}

@app.post("/session/create")
async def create_session():
    """Create a new conversation session"""
    session_id = str(uuid.uuid4())
    conversations[session_id] = ConversationManager()
    
    # Create session in database for AI interaction logging
    try:
        # Pass the session_id explicitly to ensure it's created with the correct ID
        created_session_id = db_service.create_session(session_id=session_id)
        print(f"✅ Created database session: {created_session_id}")
    except Exception as e:
        print(f"⚠️ Failed to create database session: {e}")
        import traceback
        traceback.print_exc()
    
    return {"session_id": session_id}

@app.post("/test/transcribe")
async def test_transcribe(audio_file: UploadFile = File(...)):
    """Test transcription with an audio file"""
    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=True, suffix=".wav") as temp_file:
        # Write uploaded file to temp file
        temp_file.write(await audio_file.read())
        temp_file.flush()
        
        # Read audio data
        try:
            audio_data, _ = sf.read(temp_file.name)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading audio file: {str(e)}")
        
        # Transcribe
        start_time = time.time()
        result = transcribe_audio(audio_data)
        processing_time = time.time() - start_time
        
        return {
            "transcription": result,
            "processing_time_ms": round(processing_time * 1000, 2)
        }

@app.post("/test/llm")
async def test_llm(request: TextRequest):
    """Test LLM with a text prompt - returns structured response"""
    # Use existing session or create a new one
    session_id = request.session_id
    if not session_id or session_id not in conversations:
        session_id = str(uuid.uuid4())
        conversations[session_id] = ConversationManager()
    
    conversation = conversations[session_id]
    
    # Process with LLM using structured response with conversation context
    start_time = time.time()
    try:
        structured_response = conversation.generate_structured_response(
            request.text, 
            conversation_history=request.conversation_history
        )
        processing_time = time.time() - start_time
    except Exception as e:
        print(f"⚠️  LLM failed: {e}")
        # Fallback to basic NLP processor
        processor = ResumeQueryProcessor()
        result = processor.query(request.text)
        
        # Format result to match expected structure
        fallback_text = "LLM is busy right now, but I was smart while designing this, so here you go:"
        if result.item_type == "none":
            fallback_text = "I'm having trouble processing that right now. Try asking me about his projects, experience, or skills!"
        
        structured_response = {
            "response": fallback_text,
            "items": result.items,
            "item_type": result.item_type,
            "metadata": {
                **result.metadata,
                "fallback_mode": True,
                "llm_error": str(e)
            }
        }
        processing_time = time.time() - start_time
    
    return {
        "session_id": session_id,
        "response": structured_response["response"],
        "items": structured_response["items"],
        "item_type": structured_response["item_type"],
        "metadata": structured_response["metadata"],
        "processing_time_ms": round(processing_time * 1000, 2)
    }

# Store for tracking user requests and background tasks
user_request_counts = {}
background_tasks = {}

class SmartRequest(BaseModel):
    text: str
    session_id: str = None
    conversation_history: list = []
    user_id: str = None  # For rate limiting

@app.post("/smart/query")
async def smart_query(request: SmartRequest):
    """Smart query with immediate NLP response and optional background LLM enhancement"""
    start_time = time.time()
    
    # Generate user_id for rate limiting if not provided
    user_id = request.user_id or str(uuid.uuid4())
    
    # Track request count for rate limiting
    if user_id not in user_request_counts:
        user_request_counts[user_id] = 0
    user_request_counts[user_id] += 1
    
    # Check if user exceeded rate limit (3 requests)
    if user_request_counts[user_id] > 3:
        return {
            "session_id": request.session_id or str(uuid.uuid4()),
            "response": "Hey there! 👋 This is a completely free product and I want to keep it that way, so let's not exhaust my LLM credits please 😅 If you like what you see, check out my resume and let's connect! You can find my contact info in the header.",
            "items": [],
            "item_type": "rate_limit",
            "metadata": {
                "rate_limited": True,
                "request_count": user_request_counts[user_id],
                "message": "Rate limit reached - please view resume and connect!"
            },
            "processing_time_ms": round((time.time() - start_time) * 1000, 2),
            "user_id": user_id,
            "llm_enhancement": None
        }
    
    # For first 2 queries: Try LLM with 5-second timeout (premium experience)
    # For subsequent queries: Immediate NLP + background enhancement (fast experience)
    # Use the frontend's session_id if provided, otherwise use AI session logger's session
    session_id = request.session_id or ai_logger.current_session_id or str(uuid.uuid4())
    
    # NEW ARCHITECTURE: NLP First (cards), LLM Second (response text only)
    # Step 1: NLP gets cards FAST
    processor = ResumeQueryProcessor()
    print(f"🔍 API DEBUG - Query: '{request.text}', Conversation history length: {len(request.conversation_history) if request.conversation_history else 0}")
    if request.conversation_history:
        print(f"🔍 API DEBUG - Last conversation entry: {request.conversation_history[-1] if request.conversation_history else 'None'}")
    nlp_result = processor.query(request.text, conversation_history=request.conversation_history)
    
    # Apply basic intelligent selection to limit results (similar to LLM service)
    def _select_diverse_items(items: list, max_items: int) -> list:
        """Select diverse items across different content types and categories"""
        if len(items) <= max_items:
            return items
        
        # Group items by content source (projects, experience, publications)
        grouped = {}
        for item in items:
            source = item.get("content_source", "unknown")
            if source not in grouped:
                grouped[source] = []
            grouped[source].append(item)
        
        # Select items with diversity
        selected = []
        content_types = list(grouped.keys())
        
        # Round-robin selection across content types
        while len(selected) < max_items and any(grouped.values()):
            for content_type in content_types:
                if len(selected) >= max_items:
                    break
                if grouped[content_type]:
                    selected.append(grouped[content_type].pop(0))
        
        return selected
    
    # Ensure all items have content_source set (fix diversity issue)
    for item in nlp_result.items:
        if 'content_source' not in item or not item.get('content_source') or item.get('content_source') == 'unknown':
            # Infer from item_type and item structure
            if nlp_result.item_type in ['projects', 'experience', 'publications', 'skills', 'blog']:
                item['content_source'] = nlp_result.item_type
            elif nlp_result.item_type == 'mixed':
                # Try to infer from item fields
                if 'company' in item or 'role' in item:
                    item['content_source'] = 'experience'
                elif 'authors' in item or 'journal' in item:
                    item['content_source'] = 'publications'
                elif 'tech_stack' in item or 'link' in item:
                    item['content_source'] = 'projects'
                else:
                    item['content_source'] = 'projects'  # Default
    
    # Limit fast NLP results to 4 items maximum with diversity
    max_fast_items = 4
    if len(nlp_result.items) > max_fast_items:
        selected_items = _select_diverse_items(nlp_result.items, max_fast_items)
        print(f"🎯 Fast NLP: Limited {len(nlp_result.items)} items to {len(selected_items)} diverse items")
    else:
        selected_items = nlp_result.items
    
    # Step 2: Try LLM for quirky response (lightweight call)
    llm_response_text = None
    llm_generated = False
    
    try:
        print(f"🎯 Calling LLM for quirky response (Query {user_request_counts[user_id]})")
        
        # Use existing session or create new one
        if session_id not in conversations:
            conversations[session_id] = ConversationManager()
        conversation = conversations[session_id]
        
        # Build MINIMAL context for LLM (no resume data, just query context)
        llm_context = {
            "query": request.text,
            "tech_requested": nlp_result.metadata.get('requested_technologies', []),
            "tech_found": nlp_result.metadata.get('tech_filters', []),
            "similar_tech": nlp_result.metadata.get('similar_technologies_found', []),
            "is_fallback": nlp_result.metadata.get('fallback_search', False),
            "tech_not_found": nlp_result.metadata.get('tech_not_found', False),
            "item_count": len(selected_items),
            "item_type": nlp_result.item_type
        }
        
        # NEW: Add item summaries so LLM can reference specific projects/companies
        item_summaries = []
        for item in selected_items[:4]:  # Max 4 items to keep tokens low
            title = item.get('title', item.get('role', item.get('name', 'Unknown')))
            
            # Get key techs (first 3-4 only) - handle both list and dict
            techs = []
            if 'tech_stack' in item and item['tech_stack']:
                if isinstance(item['tech_stack'], list):
                    techs = item['tech_stack'][:4]
                elif isinstance(item['tech_stack'], dict):
                    # If dict, flatten all values
                    for tech_list in item['tech_stack'].values():
                        if isinstance(tech_list, list):
                            techs.extend(tech_list)
                    techs = techs[:4]  # Limit to 4
            elif 'technologies' in item and item['technologies']:
                if isinstance(item['technologies'], list):
                    techs = item['technologies'][:4]
            
            # Get context (company, university, journal)
            context = item.get('company', item.get('university', item.get('journal', '')))
            
            # Build compact summary
            summary = f"{title}"
            if context:
                summary += f" @ {context}"
            if techs:
                summary += f" ({', '.join(techs)})"
            
            item_summaries.append(summary)
        
        # Create minimal prompt for LLM with item context
        items_text = "\n".join([f"{i+1}. {s}" for i, s in enumerate(item_summaries)]) if item_summaries else "No items"
        
        llm_prompt = f"""User asked: "{request.text}"

Context:
- Requested tech: {llm_context['tech_requested']}
- Found tech: {llm_context['tech_found']}
- Similar tech found: {llm_context['similar_tech']}
- Is fallback search: {llm_context['is_fallback']}
- Tech not in resume: {llm_context['tech_not_found']}

Items to show ({llm_context['item_count']} {llm_context['item_type']}):
{items_text}

CRITICAL: Generate a SHORT, QUIRKY response (max 30 words). 
- If you reference items, use their ACTUAL NAMES (e.g., "Portfolio AI Mode", "Dataplatr"), NOT numbers like "item 1" or "item 3"!
- If fallback/missing tech, be EXTRA creative with puns!
- Mention specific project/company names when relevant."""
        
        # Call LLM with short timeout (it's just generating one sentence!)
        async def get_llm_response():
            # Simple completion call (not the full structured response)
            response = conversation.client.chat.completions.create(
                model=conversation.model,
                messages=[
                    {"role": "system", "content": conversation.system_prompt},
                    {"role": "user", "content": llm_prompt}
                ],
                temperature=0.9,  # Higher temp for more creativity
                max_tokens=100  # Just one sentence!
            )
            return response.choices[0].message.content.strip()
        
        llm_response_text = await asyncio.wait_for(get_llm_response(), timeout=5.0)
        llm_generated = True
        print(f"✅ LLM response: {llm_response_text}")
        
        # Log AI interaction for session tracking (for ALL queries)
        print(f"🔍 About to log AI interaction for session: {session_id}")
        try:
            log_result = log_ai_interaction(
                prompt=request.text,
                response=llm_response_text,
                model_used="gpt-4",
                tokens_used=None,
                session_id=session_id
            )
            print(f"🔍 AI interaction logging result: {log_result}")
        except Exception as log_error:
            print(f"⚠️ Failed to log AI interaction: {log_error}")
            import traceback
            traceback.print_exc()
        
    except asyncio.TimeoutError:
        print(f"⏰ LLM timeout - using NLP fallback response")
        # Log AI interaction for timeout case
        print(f"🔍 About to log AI interaction for session: {session_id}")
        try:
            log_result = log_ai_interaction(
                prompt=request.text,
                response="LLM timeout - using NLP fallback",
                model_used="gpt-4",
                tokens_used=None,
                session_id=session_id
            )
            print(f"🔍 AI interaction logging result: {log_result}")
        except Exception as log_error:
            print(f"⚠️ Failed to log AI interaction: {log_error}")
    except Exception as e:
        error_msg = str(e)
        # Check for rate limit errors
        if 'rate_limit' in error_msg.lower() or '413' in error_msg or '429' in error_msg:
            print(f"🚫 Rate limit exceeded - using NLP fallback response")
        else:
            print(f"⚠️ LLM error ({type(e).__name__}): {error_msg[:100]} - using NLP fallback")
        
        # Log AI interaction for error case
        print(f"🔍 About to log AI interaction for session: {session_id}")
        try:
            log_result = log_ai_interaction(
                prompt=request.text,
                response=f"LLM error: {error_msg[:100]}",
                model_used="gpt-4",
                tokens_used=None,
                session_id=session_id
            )
            print(f"🔍 AI interaction logging result: {log_result}")
        except Exception as log_error:
            print(f"⚠️ Failed to log AI interaction: {log_error}")
    
    # Generate context-aware NLP response using query keywords
    def generate_contextual_response(query: str, items: list, item_type: str, metadata: dict, nlp_response: str = None) -> str:
        """Generate a context-aware response that incorporates query keywords"""
        # SPECIAL: If this is a quirky fallback response (tech not found), preserve it!
        if metadata.get('tech_not_found') and metadata.get('quirky_response_enabled') and nlp_response:
            # The NLP layer already generated a quirky response, use it!
            return nlp_response
        
        query_lower = query.lower()
        
        # Extract meaningful keywords from query (remove common words)
        common_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                       'of', 'with', 'by', 'from', 'what', 'tell', 'me', 'about', 'show', 
                       'his', 'he', 'you', 'does', 'has', 'have', 'any', 'some'}
        query_words = [w for w in query.lower().split() if w not in common_words and len(w) > 2]
        
        # Get technology filters if present
        tech_filters = metadata.get('tech_filters', [])
        
        # Check for specific contexts
        is_ml_query = any(term in query_lower for term in ['machine learning', 'ml', 'ai', 'artificial intelligence'])
        is_python_query = 'python' in query_lower
        is_react_query = 'react' in query_lower or 'frontend' in query_lower
        is_database_query = 'database' in query_lower or 'sql' in query_lower
        
        # Generate personalized responses based on context
        if item_type == "projects":
            if is_ml_query:
                return f"He's built some impressive AI and machine learning projects! Here are {len(items)}:"
            elif is_python_query:
                return f"Check out these {len(items)} Python projects he's created:"
            elif is_react_query:
                return f"Here are {len(items)} frontend/React projects from his portfolio:"
            elif tech_filters:
                tech_str = ", ".join(tech_filters[:2])  # First 2 techs
                return f"Here are {len(items)} projects using {tech_str}:"
            elif query_words:
                return f"Found {len(items)} {' '.join(query_words[:2])} projects:"
            return f"Here are {len(items)} standout projects from his portfolio:"
        
        elif item_type == "experience":
            if tech_filters:
                tech_str = ", ".join(tech_filters[:2])
                return f"Here's where he's used {tech_str} professionally:"
            elif query_words:
                return f"His work experience in {' '.join(query_words[:2])}:"
            return f"His career spans {len(items)} impressive roles:"
        
        elif item_type == "skills":
            if is_python_query or is_react_query or tech_filters:
                return f"Here are his technical skills!"
            return f"This guy's got some serious technical chops across {len(items)} areas:"
        
        elif item_type == "publications":
            return f"He's published {len(items)} research papers:"
        
        elif item_type == "mixed":
            if is_ml_query:
                return f"Here's his AI/ML work across projects and experience:"
            elif tech_filters:
                tech_str = ", ".join(tech_filters[:2])
                return f"Here's his {tech_str} work across different areas:"
            elif query_words:
                return f"Found {len(items)} items related to {' '.join(query_words[:2])}:"
            return f"Here's a mix of {len(items)} highlights from his portfolio:"
        
        elif item_type == "none":
            # Handle greetings and casual conversation
            if any(greeting in query_lower for greeting in ['hello', 'hi', 'hey', 'yo', 'sup']):
                return "Hey there! 👋 I'm here to help you explore Nitigya's work. Ask me about his projects, experience, or skills!"
            return "I'm here to help you learn about Nitigya's professional background!"
        
        # Fallback
        return f"Found {len(items)} relevant items!"
    
    # Step 3: Choose response text (LLM if available, else NLP fallback)
    if llm_response_text and llm_generated:
        # Use LLM's quirky, creative response!
        friendly_response = llm_response_text
        print(f"✅ Using LLM-generated response")
    else:
        # Fallback to NLP contextual response
        friendly_response = generate_contextual_response(
            request.text, 
            selected_items, 
            nlp_result.item_type,
            nlp_result.metadata,
            nlp_response=nlp_result.response_text
        )
        print(f"📝 Using NLP fallback response")
    
    # Prepare final response
    immediate_response = {
        "session_id": session_id,
        "response": friendly_response,
        "items": selected_items,
        "item_type": nlp_result.item_type,
        "metadata": {
            **nlp_result.metadata,
            "item_type": nlp_result.item_type,  # Add item_type to metadata for follow-ups!
            "llm_generated": llm_generated,  # Track if LLM was used
            "nlp_cards": True,  # Cards always from NLP
            "request_count": user_request_counts[user_id],
            "intelligent_selection_applied": len(selected_items) < len(nlp_result.items) if nlp_result.items else False
        },
        "processing_time_ms": round((time.time() - start_time) * 1000, 2),
        "user_id": user_id,
        "llm_enhancement": None
    }
    
    # No background tasks - LLM already called above!
    return immediate_response

async def enhance_with_llm(task_id: str, request: SmartRequest, session_id: str):
    """Background task to enhance response with LLM"""
    try:
        # Use existing session or create a new one
        if session_id not in conversations:
            conversations[session_id] = ConversationManager()
        
        conversation = conversations[session_id]
        
        # Try LLM with timeout
        try:
            structured_response = await asyncio.wait_for(
                conversation.generate_structured_response_async(
                    request.text, 
                    conversation_history=request.conversation_history
                ),
                timeout=30.0  # 30 second timeout for background task
            )
            
            background_tasks[task_id] = {
                "status": "completed",
                "result": {
                    "response": structured_response["response"],
                    "items": structured_response["items"],
                    "item_type": structured_response["item_type"],
                    "metadata": {
                        **structured_response["metadata"],
                        "llm_enhanced": True
                    }
                },
                "created_at": background_tasks[task_id]["created_at"],
                "completed_at": time.time()
            }
        except asyncio.TimeoutError:
            background_tasks[task_id] = {
                "status": "timeout",
                "result": None,
                "created_at": background_tasks[task_id]["created_at"],
                "completed_at": time.time()
            }
        except Exception as e:
            background_tasks[task_id] = {
                "status": "failed",
                "result": None,
                "error": str(e),
                "created_at": background_tasks[task_id]["created_at"],
                "completed_at": time.time()
            }
    except Exception as e:
        background_tasks[task_id] = {
            "status": "failed",
            "result": None,
            "error": str(e),
            "created_at": background_tasks.get(task_id, {}).get("created_at", time.time()),
            "completed_at": time.time()
        }

@app.get("/smart/enhancement/{task_id}")
async def get_enhancement(task_id: str):
    """Get the status/result of a background LLM enhancement"""
    if task_id not in background_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task = background_tasks[task_id]
    
    # Clean up old completed tasks (older than 5 minutes)
    if task["status"] in ["completed", "failed", "timeout"]:
        if time.time() - task.get("completed_at", 0) > 300:  # 5 minutes
            del background_tasks[task_id]
            raise HTTPException(status_code=410, detail="Task result expired")
    
    return {
        "task_id": task_id,
        "status": task["status"],
        "result": task.get("result"),
        "error": task.get("error"),
        "processing_time_seconds": task.get("completed_at", time.time()) - task["created_at"]
    }

@app.post("/test/llm-stream")
async def test_llm_stream(request: TextRequest):
    """Test LLM streaming with a text prompt"""
    from fastapi.responses import StreamingResponse
    
    # Use existing session or create a new one
    session_id = request.session_id
    if not session_id or session_id not in conversations:
        session_id = str(uuid.uuid4())
        conversations[session_id] = ConversationManager()
    
    conversation = conversations[session_id]
    conversation.add_user_message(request.text)
    
    async def stream_generator():
        buffer = ""
        for token in conversation.stream_response():
            buffer += token
            yield f"data: {token}\n\n"
    
    return StreamingResponse(stream_generator(), media_type="text/event-stream")

@app.post("/test/tts")
async def test_tts(request: TextRequest):
    """Test TTS with a text prompt - properly using async"""
    # Generate speech
    start_time = time.time()
    audio_data, sample_rate = await generate_speech_async(request.text)
    processing_time = time.time() - start_time
    
    # Save to temporary file
    output_file = f"tts_output_{uuid.uuid4()}.wav"
    sf.write(output_file, audio_data, sample_rate)
    
    # Schedule cleanup of this file
    cleanup_audio_file(output_file, delay_seconds=60)  # Longer delay for direct downloads
    print(f"🧹 Scheduled cleanup for: {output_file}")
    
    return FileResponse(
        path=output_file,
        media_type="audio/wav",
        filename="tts_output.wav",
        headers={"processing_time_ms": str(round(processing_time * 1000, 2))}
    )

@app.post("/process")
async def process_audio(
    audio_file: UploadFile = File(...),
    session_id: str = Form(None)
):
    """Process a complete audio request through the full pipeline"""
    print(f"Processing audio file: {audio_file.filename}, size: {audio_file.size if hasattr(audio_file, 'size') else 'unknown'}")
    
    # Use existing session or create a new one
    if not session_id or session_id not in conversations:
        session_id = str(uuid.uuid4())
        conversations[session_id] = ConversationManager()
        print(f"Created new session: {session_id}")
    else:
        print(f"Using existing session: {session_id}")
    
    conversation = conversations[session_id]
    
    # Create a temporary file
    with tempfile.NamedTemporaryFile(delete=True, suffix=".wav") as temp_file:
        # Save uploaded file
        file_content = await audio_file.read()
        print(f"Read {len(file_content)} bytes from upload")
        temp_file.write(file_content)
        temp_file.flush()
        
        # Read audio data
        try:
            audio_data, sample_rate = sf.read(temp_file.name)
            print(f"Audio loaded: {len(audio_data)} samples at {sample_rate}Hz")
        except Exception as e:
            print(f"Error reading audio file: {e}")
            raise HTTPException(status_code=400, detail=f"Error reading audio file: {str(e)}")
        
        # Check if we got enough audio
        if len(audio_data) < 1600:  # Less than 0.1 seconds
            print("Audio too short")
            return JSONResponse(
                status_code=200,
                content={
                    "status": "error", 
                    "message": "Audio too short",
                    "debug_info": {
                        "samples": len(audio_data),
                        "duration_seconds": len(audio_data) / sample_rate if sample_rate > 0 else 0,
                        "sample_rate": sample_rate
                    }
                }
            )
        
        print(f"Audio duration: {len(audio_data)/sample_rate:.2f} seconds")
            
        # Transcribe audio
        transcribe_start = time.time()
        try:
            transcription = transcribe_audio(audio_data)
            transcribe_time = time.time() - transcribe_start
            print(f"Transcription: '{transcription}' (took {transcribe_time:.2f}s)")
        except Exception as e:
            print(f"Transcription error: {e}")
            return JSONResponse(
                status_code=200,
                content={
                    "status": "error", 
                    "message": f"Transcription failed: {str(e)}"
                }
            )
        
        if not transcription.strip():
            print("Empty transcription result")
            return JSONResponse(
                status_code=200,
                content={
                    "status": "error", 
                    "message": "Couldn't transcribe audio - no speech detected",
                    "transcribe_time_ms": round(transcribe_time * 1000, 2),
                    "debug_info": {
                        "audio_duration": len(audio_data) / sample_rate,
                        "audio_samples": len(audio_data)
                    }
                }
            )
            
        # Process using the SAME pipeline as text queries
        print(f"🔄 Processing transcribed text: '{transcription}' using smart_query pipeline")
        
        # Create a SmartRequest object from the transcription
        smart_request = SmartRequest(
            text=transcription,
            session_id=session_id,
            conversation_history=[],  # Let the conversation manager handle its own history
            user_id=f"voice_{session_id}"  # Unique user_id for voice sessions
        )
        
        # Use the EXACT SAME logic as smart_query
        llm_start = time.time()
        try:
            smart_response = await smart_query(smart_request)
            llm_time = time.time() - llm_start
            
            # Extract the response components
            response = smart_response["response"]
            structured_items = smart_response.get("items", [])
            item_type = smart_response.get("item_type", "general")
            metadata = smart_response.get("metadata", {})
            
            print(f"✅ Smart query response: '{response}' (took {llm_time:.2f}s)")
            
        except Exception as e:
            print(f"LLM processing error: {e}")
            return JSONResponse(
                status_code=200,
                content={
                    "status": "error",
                    "message": f"LLM processing failed: {str(e)}",
                    "transcription": transcription
                }
            )
        
        # Generate speech for response - using async properly
        tts_start = time.time()
        try:
            speech_audio_data, speech_sample_rate = await generate_speech_async(response)
            tts_time = time.time() - tts_start
            print(f"TTS generated {len(speech_audio_data)} samples at {speech_sample_rate}Hz (took {tts_time:.2f}s)")
        except Exception as e:
            print(f"TTS error: {e}")
            return JSONResponse(
                status_code=200,
                content={
                    "status": "partial_success",
                    "transcription": transcription,
                    "response": response,
                    "items": structured_items,
                    "item_type": item_type,
                    "metadata": metadata,
                    "message": "Audio response generation failed",
                    "error": str(e)
                }
            )
        
        # Save to temporary file
        output_file = f"response_audio_{uuid.uuid4()}.wav"
        try:
            sf.write(output_file, speech_audio_data, speech_sample_rate)
            print(f"Audio response saved to: {output_file}")
            
            # Schedule cleanup of this file (it will be cleaned up after being served)
            # We don't cleanup immediately because the frontend still needs to fetch it
            print(f"🧹 Scheduled cleanup for: {output_file}")
            
        except Exception as e:
            print(f"Error saving audio file: {e}")
            return JSONResponse(
                status_code=200,
                content={
                    "status": "partial_success",
                    "transcription": transcription,
                    "response": response,
                    "items": structured_items,
                    "item_type": item_type,
                    "metadata": metadata,
                    "message": "Audio file save failed"
                }
            )
        
        # Log AI interaction for session tracking (for all queries)
        print(f"🔍 About to log AI interaction for session: {session_id}")
        try:
            # Use the session_id from the request (frontend's session)
            log_result = log_ai_interaction(
                prompt=transcription,
                response=response,
                model_used=conversation.model,
                tokens_used=None,  # Could be extracted from response if available
                session_id=session_id  # Pass the session_id explicitly
            )
            print(f"🔍 AI interaction logging result: {log_result}")
        except Exception as log_error:
            print(f"⚠️ Failed to log AI interaction: {log_error}")
            import traceback
            traceback.print_exc()
        
        # Return JSON response with timing info and file path
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "session_id": session_id,
                "transcription": transcription,
                "response": response,
                "items": structured_items,
                "item_type": item_type,
                "metadata": metadata,
                "audio_file": output_file,
                "timing": {
                    "transcribe_ms": round(transcribe_time * 1000, 2),
                    "llm_ms": round(llm_time * 1000, 2),
                    "tts_ms": round(tts_time * 1000, 2),
                    "total_ms": round((transcribe_time + llm_time + tts_time) * 1000, 2)
                }
            }
        )

@app.get("/audio/{filename}")
async def get_audio_file(filename: str):
    """Serve generated audio files"""
    if os.path.exists(filename):
        # Mark file as active while being served
        mark_audio_active(filename)
        
        # Schedule cleanup after serving (30 seconds delay)
        cleanup_audio_file(filename, delay_seconds=30)
        
        # Create response
        response = FileResponse(
            path=filename,
            media_type="audio/wav",
            filename="response.wav"
        )
        
        # Mark as inactive when response is ready (not perfect, but close enough)
        import asyncio
        asyncio.create_task(mark_inactive_after_delay(filename, 5))
        
        return response
    else:
        raise HTTPException(status_code=404, detail="Audio file not found")

async def mark_inactive_after_delay(filename: str, delay_seconds: int):
    """Helper to mark file as inactive after a delay"""
    await asyncio.sleep(delay_seconds)
    mark_audio_inactive(filename)

# AI Session Management Endpoints
@app.get("/api/session/stats")
async def get_session_stats():
    """Get current AI session statistics"""
    try:
        stats = get_ai_session_stats()
        return JSONResponse(content=stats)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to get session stats: {str(e)}"}
        )

@app.post("/api/session/end")
async def end_current_session():
    """End the current AI session and return final stats"""
    try:
        stats = end_ai_session()
        return JSONResponse(content=stats)
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to end session: {str(e)}"}
        )

# Debug endpoints for AI interactions
@app.get("/api/ai-interactions")
async def get_ai_interactions():
    """Get top 5 AI interactions for debugging"""
    try:
        from database_service import db_service
        if not db_service.is_connected():
            return JSONResponse(
                status_code=500,
                content={"success": False, "error": "Database not connected"}
            )
        
        # Get recent AI interactions
        interactions = db_service.get_recent_interactions(limit=5)
        return JSONResponse(content={"success": True, "interactions": interactions})
    except Exception as e:
        import traceback
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e), "traceback": traceback.format_exc()}
        )

@app.post("/api/test-ai-logging")
async def test_ai_logging():
    """Test AI interaction logging directly"""
    try:
        from database_service import db_service
        if not db_service.is_connected():
            return JSONResponse(
                status_code=500,
                content={"success": False, "error": "Database not connected"}
            )
        
        # Create a test session
        session_id = db_service.create_session("test_user")
        
        # Log a test interaction
        result = db_service.log_interaction(
            session_id=session_id,
            prompt="Test prompt from API",
            response="Test response from API",
            model_used="gpt-4",
            tokens_used=50
        )
        
        return JSONResponse(content={
            "success": True, 
            "session_id": session_id,
            "interaction_result": result
        })
    except Exception as e:
        import traceback
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e), "traceback": traceback.format_exc()}
        )

if __name__ == "__main__":
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)