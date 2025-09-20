#!/usr/bin/env python3
"""
Complete audio pipeline test
Creates sample audio and tests the full VAD->Whisper->LLM->TTS pipeline
"""

import numpy as np
import soundfile as sf
import requests
import json
import time
import asyncio
from pathlib import Path

def create_test_audio():
    """Create a simple test audio file with speech-like content"""
    # Generate a simple sine wave that represents speech
    sample_rate = 16000
    duration = 2.0  # 2 seconds
    frequency = 200  # Low frequency like human speech
    
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Create a modulated sine wave that resembles speech patterns
    audio = np.sin(2 * np.pi * frequency * t)
    
    # Add some envelope and modulation to make it more speech-like
    envelope = np.exp(-t * 0.5)  # Fade out
    modulation = 1 + 0.3 * np.sin(2 * np.pi * 5 * t)  # 5 Hz modulation
    
    audio = audio * envelope * modulation * 0.3  # Scale down volume
    
    # Add some noise to make it more realistic
    noise = np.random.normal(0, 0.05, len(audio))
    audio = audio + noise
    
    # Ensure proper format
    audio = audio.astype(np.float32)
    
    return audio, sample_rate

def test_audio_upload(server_url="http://localhost:8000"):
    """Test uploading audio to the backend"""
    print("🎵 Creating test audio...")
    audio_data, sample_rate = create_test_audio()
    
    # Save to temporary file
    test_file = "test_speech.wav"
    sf.write(test_file, audio_data, sample_rate)
    print(f"✅ Created test audio: {test_file} ({len(audio_data)} samples, {sample_rate}Hz)")
    
    print("📤 Testing audio upload to backend...")
    
    try:
        # Test server connection first
        response = requests.get(server_url, timeout=5)
        if response.status_code != 200:
            print(f"❌ Server not responding: {response.status_code}")
            return False
        print("✅ Server is running")
        
        # Upload audio file
        with open(test_file, 'rb') as f:
            files = {'audio_file': f}
            data = {'session_id': 'test_session_123'}
            
            print(f"🔄 Uploading to {server_url}/process...")
            response = requests.post(
                f"{server_url}/process",
                files=files,
                data=data,
                timeout=30
            )
        
        print(f"📥 Response: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Upload successful!")
            print(f"Status: {result.get('status')}")
            print(f"Transcription: {result.get('transcription', 'N/A')}")
            print(f"Response: {result.get('response', 'N/A')}")
            
            if 'timing' in result:
                timing = result['timing']
                print(f"Timing - Transcribe: {timing.get('transcribe_ms')}ms, "
                      f"LLM: {timing.get('llm_ms')}ms, "
                      f"TTS: {timing.get('tts_ms')}ms")
            
            if result.get('audio_file'):
                print(f"Audio response: {result['audio_file']}")
            
            return True
        else:
            print(f"❌ Upload failed: {response.status_code}")
            try:
                error_info = response.json()
                print(f"Error details: {error_info}")
            except:
                print(f"Error text: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    finally:
        # Clean up
        if Path(test_file).exists():
            Path(test_file).unlink()

def test_whisper_directly():
    """Test Whisper transcription directly"""
    print("\n🎤 Testing Whisper directly...")
    
    try:
        from transcribe_service import transcribe_audio
        
        # Create test audio
        audio_data, sample_rate = create_test_audio()
        
        print(f"Audio: {len(audio_data)} samples at {sample_rate}Hz")
        
        # Test transcription
        start_time = time.time()
        transcription = transcribe_audio(audio_data)
        duration = time.time() - start_time
        
        print(f"✅ Transcription completed in {duration:.2f}s")
        print(f"Result: '{transcription}'")
        
        return True
        
    except Exception as e:
        print(f"❌ Whisper test failed: {e}")
        return False

async def test_tts_directly():
    """Test TTS directly"""
    print("\n🔊 Testing TTS directly...")
    
    try:
        from tts_service import generate_speech_async
        
        test_text = "Hello, this is a test of the text to speech system."
        
        start_time = time.time()
        audio_data, sample_rate = await generate_speech_async(test_text)
        duration = time.time() - start_time
        
        print(f"✅ TTS completed in {duration:.2f}s")
        print(f"Generated {len(audio_data)} samples at {sample_rate}Hz")
        
        # Save the result
        sf.write("tts_test_output.wav", audio_data, sample_rate)
        print("🎵 TTS output saved to: tts_test_output.wav")
        
        return True
        
    except Exception as e:
        print(f"❌ TTS test failed: {e}")
        return False

def main():
    print("🧪 Complete Audio Pipeline Test\n")
    
    # Test individual components first
    whisper_ok = test_whisper_directly()
    tts_ok = asyncio.run(test_tts_directly())
    
    print(f"\n📊 Component Tests:")
    print(f"Whisper: {'✅' if whisper_ok else '❌'}")
    print(f"TTS: {'✅' if tts_ok else '❌'}")
    
    # Test full pipeline
    print(f"\n🔄 Testing complete pipeline...")
    pipeline_ok = test_audio_upload()
    
    print(f"\n📊 Final Results:")
    print(f"Whisper: {'✅' if whisper_ok else '❌'}")
    print(f"TTS: {'✅' if tts_ok else '❌'}")
    print(f"Full Pipeline: {'✅' if pipeline_ok else '❌'}")
    
    if all([whisper_ok, tts_ok, pipeline_ok]):
        print("\n🎉 All audio systems working!")
    else:
        print("\n⚠️ Some audio systems need attention")
        
        if not pipeline_ok:
            print("\n💡 Make sure to start the backend server first:")
            print("   cd backend && python api_server.py")

if __name__ == "__main__":
    main()