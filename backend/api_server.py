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
from vad_service import record_until_silence
from audio_cleanup import init_cleanup_service, cleanup_audio_file, mark_audio_active, mark_audio_inactive
from transcribe_service import transcribe_audio
from llm_service import ConversationManager
from tts_service import generate_speech_async  # Use the async version directly
from resume_query_processor import ResumeQueryProcessor

app = FastAPI(title="AI Assistant API")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize audio cleanup service
@app.on_event("startup")
async def startup_event():
    init_cleanup_service()
    print("🧹 Audio cleanup service started")

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
    session_id = request.session_id or str(uuid.uuid4())
    
    if user_request_counts[user_id] <= 2:
        # PREMIUM EXPERIENCE: Wait for LLM with timeout for first 2 queries
        try:
            # Use existing session or create a new one
            if session_id not in conversations:
                conversations[session_id] = ConversationManager()
            
            conversation = conversations[session_id]
            
            # Try LLM with 5-second timeout
            structured_response = await asyncio.wait_for(
                conversation.generate_structured_response_async(
                    request.text, 
                    conversation_history=request.conversation_history
                ),
                timeout=5.0  # 5-second timeout for premium experience
            )
            
            return {
                "session_id": session_id,
                "response": structured_response["response"],
                "items": structured_response["items"],
                "item_type": structured_response["item_type"],
                "metadata": {
                    **structured_response["metadata"],
                    "premium_llm_response": True,
                    "request_count": user_request_counts[user_id]
                },
                "processing_time_ms": round((time.time() - start_time) * 1000, 2),
                "user_id": user_id,
                "llm_enhancement": None
            }
            
        except asyncio.TimeoutError:
            print(f"⏰ LLM timeout for user {user_id} query {user_request_counts[user_id]} - falling back to NLP")
        except Exception as e:
            print(f"⚠️ LLM error for user {user_id}: {e} - falling back to NLP")
    
    # FAST EXPERIENCE: Immediate NLP response + background enhancement
    # (Used for: timeouts on first 2 queries, or all queries after 2nd)
    processor = ResumeQueryProcessor()
    nlp_result = processor.query(request.text, conversation_history=request.conversation_history)
    
    # Improve the NLP response to be more friendly
    friendly_response = nlp_result.response_text
    if friendly_response.startswith("Found ") and "matching your query" in friendly_response:
        # Make generic responses more personality-driven
        if nlp_result.item_type == "projects":
            friendly_response = "Let me show you some of his awesome projects!"
        elif nlp_result.item_type == "experience":
            friendly_response = "Here's where he's worked and made his mark!"
        elif nlp_result.item_type == "skills":
            friendly_response = "This guy's got some serious technical chops!"
        elif nlp_result.item_type == "publications":
            friendly_response = "Check out his research contributions!"
        elif nlp_result.item_type == "blog":
            friendly_response = "Here are some insights he's shared with the world!"
    
    # Prepare immediate response
    immediate_response = {
        "session_id": session_id,
        "response": friendly_response,
        "items": nlp_result.items,
        "item_type": nlp_result.item_type,
        "metadata": {
            **nlp_result.metadata,
            "fast_nlp_response": True,
            "llm_enhancement_pending": True,
            "request_count": user_request_counts[user_id]
        },
        "processing_time_ms": round((time.time() - start_time) * 1000, 2),
        "user_id": user_id,
        "llm_enhancement": None
    }
    
    # Start background LLM enhancement task (don't await it)
    task_id = str(uuid.uuid4())
    background_tasks[task_id] = {
        "status": "pending",
        "result": None,
        "created_at": time.time()
    }
    
    # Fire-and-forget background task
    asyncio.create_task(enhance_with_llm(
        task_id, 
        request, 
        session_id
    ))
    
    immediate_response["llm_enhancement"] = {
        "task_id": task_id,
        "status": "pending",
        "check_url": f"/smart/enhancement/{task_id}"
    }
    
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
            
        # Process with LLM using structured response
        llm_start = time.time()
        try:
            structured_response = conversation.generate_structured_response(transcription)
            response = structured_response["response"]
            llm_time = time.time() - llm_start
            print(f"LLM response: '{response}' (took {llm_time:.2f}s)")
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
                    "items": structured_response["items"],
                    "item_type": structured_response["item_type"],
                    "metadata": structured_response["metadata"],
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
                    "items": structured_response["items"],
                    "item_type": structured_response["item_type"],
                    "metadata": structured_response["metadata"],
                    "message": "Audio file save failed"
                }
            )
        
        # Return JSON response with timing info and file path
        return JSONResponse(
            status_code=200,
            content={
                "status": "success",
                "session_id": session_id,
                "transcription": transcription,
                "response": response,
                "items": structured_response["items"],
                "item_type": structured_response["item_type"],
                "metadata": structured_response["metadata"],
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

if __name__ == "__main__":
    uvicorn.run("api_server:app", host="0.0.0.0", port=8000, reload=True)