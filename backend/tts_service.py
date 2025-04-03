# tts_service.py
import asyncio
import soundfile as sf
import sounddevice as sd
import numpy as np
from edge_tts import Communicate

async def generate_speech_async(text):
    """Generate speech from text using Edge TTS"""
    print(f"Generating speech for: '{text}'")
    
    # Create communicator
    communicate = Communicate(text, voice="en-US-JennyNeural")
    
    # Create filename for this speech
    output_filename = "temp_speech_output.wav"
    
    # Use the communicate.save method
    await communicate.save(output_filename)
    
    # Load the saved file with soundfile
    audio_data, sample_rate = sf.read(output_filename)
    
    return audio_data, sample_rate

# Don't use asyncio.run in the synchronous wrapper - this doesn't work in FastAPI
def generate_speech(text):
    """
    Synchronous wrapper - DO NOT USE IN FASTAPI
    Only use this for command line testing
    """
    return asyncio.run(generate_speech_async(text))

def play_audio(audio_data, sample_rate):
    """Play audio through speakers"""
    sd.play(audio_data, sample_rate)
    sd.wait()

# Test function
async def test_tts_async():
    test_text = "Hello, this is a test of the text to speech system."
    try:
        audio_data, sample_rate = await generate_speech_async(test_text)
        print(f"Generated audio with {len(audio_data)} samples at {sample_rate}Hz")
        print("Playing audio...")
        play_audio(audio_data, sample_rate)
    except Exception as e:
        print(f"Error testing TTS: {e}")
        import traceback
        traceback.print_exc()

def test_tts():
    asyncio.run(test_tts_async())

if __name__ == "__main__":
    test_tts()