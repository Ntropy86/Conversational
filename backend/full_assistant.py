# full_assistant.py
import os
import numpy as np
import time
import re
from vad_service import record_until_silence
from transcribe_service import transcribe_audio
from llm_service import ConversationManager
from tts_service import generate_speech
import soundfile as sf
import sounddevice as sd
import signal
import sys

def play_audio(audio_data, sample_rate):
    """Play audio data through speakers"""
    sd.play(audio_data, sample_rate)
    sd.wait()

def is_complete(text):
    """Check if a text chunk is a complete sentence"""
    return bool(re.search(r"[.!?][\"']?$", text.strip()))

def signal_handler(sig, frame):
    print("\nGracefully shutting down...")
    print("Closing audio streams...")
    sd.stop()  # Stop any playing audio
    print("Exiting assistant. Goodbye!")
    sys.exit(0)


def run_assistant():
    """Run the complete assistant flow"""
    print("\n✨ Starting AI Assistant")
    print("Initializing components...")
    signal.signal(signal.SIGINT, signal_handler)
    # Initialize conversation manager
    conversation = ConversationManager()
    
    print("Ready! Start speaking and I'll respond when you pause...")
    
    try:
        while True:
            # Step 1: Record audio until silence detected
            print("\nListening...")
            audio = record_until_silence()
            
            # Check if we got enough audio
            if len(audio) < 1600:  # Less than 0.1 seconds
                print("Didn't catch that - audio too short")
                continue
            
            # Step 2: Transcribe audio
            print("Processing...")
            text = transcribe_audio(audio)
            if not text.strip():
                print("Couldn't understand audio - no transcription")
                continue
                
            print(f"You said: {text}")
            
            # Step 3: Add to conversation and get response
            conversation.add_user_message(text)
            
            # Step 4: Stream response and buffer by sentences
            buffer = ""
            print("Response: ", end="", flush=True)
            
            for token in conversation.stream_response():
                print(token, end="", flush=True)
                buffer += token
                
                # If we have a complete sentence, speak it
                if is_complete(buffer):
                    print("\nSpeaking partial response...")
                    audio_data, sample_rate = generate_speech(buffer.strip())
                    play_audio(audio_data, sample_rate)
                    buffer = ""
            
            # Speak any remaining text
            if buffer.strip():
                print("\nSpeaking remaining response...")
                audio_data = generate_speech(buffer.strip())
                play_audio(audio_data)
                
    except KeyboardInterrupt:
        print("\nExiting assistant...")

if __name__ == "__main__":
    # Make sure GROQ_API_KEY is set
    if not os.getenv("GROQ_API_KEY"):
        print("Error: GROQ_API_KEY not set. Run: export GROQ_API_KEY=your_key_here")
        exit(1)
        
    run_assistant()