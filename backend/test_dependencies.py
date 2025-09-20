#!/usr/bin/env python3
"""
Test script to verify all backend dependencies are working
"""

def test_imports():
    """Test all required imports"""
    print("Testing imports...")
    
    try:
        import torch
        print("✅ PyTorch imported successfully")
    except ImportError as e:
        print(f"❌ PyTorch import failed: {e}")
    
    try:
        from faster_whisper import WhisperModel
        print("✅ faster-whisper imported successfully")
    except ImportError as e:
        print(f"❌ faster-whisper import failed: {e}")
    
    try:
        import edge_tts
        print("✅ edge-tts imported successfully")
    except ImportError as e:
        print(f"❌ edge-tts import failed: {e}")
        
    try:
        import soundfile as sf
        print("✅ soundfile imported successfully")
    except ImportError as e:
        print(f"❌ soundfile import failed: {e}")
        
    try:
        import sounddevice as sd
        print("✅ sounddevice imported successfully")
    except ImportError as e:
        print(f"❌ sounddevice import failed: {e}")
        
    try:
        import numpy as np
        print("✅ numpy imported successfully")
    except ImportError as e:
        print(f"❌ numpy import failed: {e}")

def test_whisper():
    """Test Whisper model loading"""
    print("\nTesting Whisper model...")
    try:
        from faster_whisper import WhisperModel
        model = WhisperModel("tiny", device="cpu", compute_type="int8")
        print("✅ Whisper tiny model loaded successfully")
        return True
    except Exception as e:
        print(f"❌ Whisper model failed: {e}")
        return False

def test_tts():
    """Test TTS functionality"""
    print("\nTesting TTS...")
    try:
        import asyncio
        import edge_tts
        
        async def test_tts_async():
            communicate = edge_tts.Communicate("Hello world", "en-US-JennyNeural")
            # Just test creation, don't actually generate
            return True
        
        result = asyncio.run(test_tts_async())
        if result:
            print("✅ TTS setup successful")
            return True
    except Exception as e:
        print(f"❌ TTS test failed: {e}")
        return False

def test_vad():
    """Test VAD model loading"""
    print("\nTesting VAD model...")
    try:
        import torch
        vad_model, utils = torch.hub.load("snakers4/silero-vad", "silero_vad", trust_repo=True)
        print("✅ VAD model loaded successfully")
        return True
    except Exception as e:
        print(f"❌ VAD model failed: {e}")
        return False

def main():
    print("🔧 Backend Dependencies Test\n")
    
    test_imports()
    
    whisper_ok = test_whisper()
    tts_ok = test_tts()
    vad_ok = test_vad()
    
    print("\n📊 Summary:")
    print(f"Whisper: {'✅' if whisper_ok else '❌'}")
    print(f"TTS: {'✅' if tts_ok else '❌'}")
    print(f"VAD: {'✅' if vad_ok else '❌'}")
    
    if all([whisper_ok, tts_ok, vad_ok]):
        print("\n🎉 All systems ready!")
    else:
        print("\n⚠️ Some systems need attention")

if __name__ == "__main__":
    main()