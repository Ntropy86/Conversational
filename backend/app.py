# test_components.py
import os
import requests
import base64
import argparse
import soundfile as sf
import numpy as np
from pydub import AudioSegment
from pydub.playback import play

# API endpoint
API_BASE = "http://localhost:8000"

def record_audio(duration=5):
    """Record audio from microphone"""
    try:
        import sounddevice as sd
        sample_rate = 16000
        print(f"Recording for {duration} seconds...")
        audio = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1)
        sd.wait()
        audio = audio.flatten()  # Flatten to mono
        
        # Save to file
        sf.write('test_recording.wav', audio, sample_rate)
        print("Recording saved to 'test_recording.wav'")
        return 'test_recording.wav'
    except Exception as e:
        print(f"Error recording audio: {e}")
        print("Please provide an audio file manually.")
        return None

def test_vad(audio_file):
    """Test the VAD service"""
    with open(audio_file, 'rb') as f:
        files = {'audio_file': ('audio.wav', f, 'audio/wav')}
        response = requests.post(f"{API_BASE}/test/vad", files=files)
    
    print("VAD Test Result:")
    print(response.json())

def test_transcribe(audio_file):
    """Test the transcription service"""
    with open(audio_file, 'rb') as f:
        files = {'audio_file': ('audio.wav', f, 'audio/wav')}
        response = requests.post(f"{API_BASE}/test/transcribe", files=files)
    
    print("Transcription Test Result:")
    print(response.json())

def test_llm(text):
    """Test the LLM service"""
    response = requests.post(
        f"{API_BASE}/test/llm", 
        json={"text": text}
    )
    
    print("LLM Test Result:")
    print(response.json())

def test_tts(text):
    """Test the TTS service"""
    response = requests.post(
        f"{API_BASE}/test/tts", 
        json={"text": text}
    )
    
    result = response.json()
    print("TTS Test Result:")
    print(f"Generated {len(result['audio'])} bytes of base64 audio")
    
    # Decode and play audio
    audio_data = base64.b64decode(result['audio'])
    with open('tts_output.wav', 'wb') as f:
        f.write(audio_data)
    
    print("Audio saved to 'tts_output.wav'")
    
    # Play the audio
    try:
        audio = AudioSegment.from_wav('tts_output.wav')
        play(audio)
    except Exception as e:
        print(f"Error playing audio: {e}")
        print("Audio file saved to 'tts_output.wav' for manual listening")

def test_full_pipeline(audio_file):
    """Test the full pipeline"""
    with open(audio_file, 'rb') as f:
        files = {'audio_file': ('audio.wav', f, 'audio/wav')}
        response = requests.post(f"{API_BASE}/process-audio", files=files)
    
    result = response.json()
    print("Full Pipeline Test Result:")
    print(f"Status: {result.get('status')}")
    
    if result.get('status') == 'success':
        print(f"Transcription: {result.get('transcription')}")
        print(f"Response: {result.get('response')}")
        
        # Decode and play audio response
        audio_data = base64.b64decode(result.get('audio', ''))
        with open('response_audio.wav', 'wb') as f:
            f.write(audio_data)
        
        print("Response audio saved to 'response_audio.wav'")
        
        # Play the audio
        try:
            audio = AudioSegment.from_wav('response_audio.wav')
            play(audio)
        except Exception as e:
            print(f"Error playing audio: {e}")

def main():
    parser = argparse.ArgumentParser(description='Test AI Assistant components')
    parser.add_argument('component', choices=['vad', 'transcribe', 'llm', 'tts', 'full'], 
                        help='Component to test')
    parser.add_argument('--audio', help='Audio file path (for vad, transcribe, full)')
    parser.add_argument('--text', help='Text for LLM/TTS testing')
    parser.add_argument('--record', action='store_true', help='Record new audio for testing')
    
    args = parser.parse_args()
    
    # Check if API is running
    try:
        requests.get(API_BASE)
    except requests.exceptions.ConnectionError:
        print(f"Error: API is not running at {API_BASE}")
        print("Start the API server with: python app.py")
        return
        
    # Record or use provided audio
    audio_file = None
    if args.component in ['vad', 'transcribe', 'full']:
        if args.record:
            audio_file = record_audio()
        elif args.audio:
            audio_file = args.audio
        else:
            print("Please provide an audio file with --audio or use --record to record one")
            return
    
    # Run the chosen test
    if args.component == 'vad':
        test_vad(audio_file)
    elif args.component == 'transcribe':
        test_transcribe(audio_file)
    elif args.component == 'llm':
        if not args.text:
            args.text = input("Enter text to send to LLM: ")
        test_llm(args.text)
    elif args.component == 'tts':
        if not args.text:
            args.text = input("Enter text for TTS: ")
        test_tts(args.text)
    elif args.component == 'full':
        test_full_pipeline(audio_file)

if __name__ == "__main__":
    main()