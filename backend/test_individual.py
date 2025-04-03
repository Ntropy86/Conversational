# test_individual.py
import argparse
import numpy as np
import soundfile as sf
import sounddevice as sd
import os

# Import components
from vad_service import record_until_silence
from transcribe_service import transcribe_audio
from llm_service import ConversationManager
from tts_service import generate_speech, play_audio

def test_vad():
    """Test Voice Activity Detection"""
    print("Testing VAD - speak into your microphone")
    print("Recording will stop when silence is detected...")
    audio = record_until_silence()
    
    if len(audio) > 0:
        print(f"Recorded {len(audio)/16000:.2f} seconds of audio")
        sf.write("vad_test.wav", audio, 16000)
        print("Saved recording to 'vad_test.wav'")
    else:
        print("No audio recorded or operation canceled")

def test_transcribe(audio_file=None):
    """Test Transcription"""
    if audio_file and os.path.exists(audio_file):
        print(f"Transcribing file: {audio_file}")
        audio, _ = sf.read(audio_file)
    else:
        print("No file provided, recording from microphone...")
        audio = record_until_silence()
        
    text = transcribe_audio(audio)
    print(f"Transcription: {text}")

def test_llm(text=None):
    """Test LLM response"""
    if not text:
        text = input("Enter text to send to LLM: ")
        
    # Create ONE conversation manager for both tests
    conversation = ConversationManager()
    
    # First test - non-streaming
    conversation.add_user_message(text)
    print("Non-streaming response:")
    response, _ = conversation.generate_response()
    print(f"Response: {response}")
    
    # Second test with a different prompt
    second_prompt = "Tell me about your skills in data science"  
    print(f"\nTesting streaming with different prompt: '{second_prompt}'")
    conversation.add_user_message(second_prompt)
    print("Response: ", end="", flush=True)
    for token in conversation.stream_response():
        print(token, end="", flush=True)
    print()  # New line

def test_tts(text=None):
    """Test Text-to-Speech"""
    if not text:
        text = input("Enter text for speech synthesis: ")
        
    print(f"Generating speech for: '{text}'")
    audio_data, sample_rate = generate_speech(text)
    
    print(f"Playing generated audio ({len(audio_data)} samples at {sample_rate}Hz)...")
    play_audio(audio_data, sample_rate)

def main():
    parser = argparse.ArgumentParser(description="Test AI Assistant components")
    parser.add_argument('component', choices=['vad', 'transcribe', 'llm', 'tts', 'all'],
                      help='Component to test')
    parser.add_argument('--input', '-i', help='Input file for transcribe/TTS or text for LLM/TTS')
    
    args = parser.parse_args()
    
    # Check for GROQ API key if testing LLM
    if args.component in ['llm', 'all'] and not os.getenv("GROQ_API_KEY"):
        print("Error: GROQ_API_KEY environment variable not set")
        print("Run: export GROQ_API_KEY=your_key_here")
        return
        
    # Run the selected test
    if args.component == 'vad':
        test_vad()
    elif args.component == 'transcribe':
        test_transcribe(args.input)
    elif args.component == 'llm':
        test_llm(args.input)
    elif args.component == 'tts':
        test_tts(args.input)
    elif args.component == 'all':
        print("Testing all components in sequence")
        test_vad()
        test_transcribe("vad_test.wav")
        test_llm()
        test_tts()

if __name__ == "__main__":
    main()