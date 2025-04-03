# transcribe_service.py
import tempfile
import soundfile as sf
import numpy as np
from faster_whisper import WhisperModel

# Choose model size based on your hardware (tiny, base, small, medium, large-v3)
print("Loading Whisper model...")
model = WhisperModel("base", device="cpu", compute_type="int8")  # Start with smaller model
print("Whisper model loaded successfully")

def transcribe_audio(audio_np):
    """Transcribe audio data to text"""
    # Create temp file from audio data
    with tempfile.NamedTemporaryFile(suffix=".wav", delete=True) as temp_file:
        sf.write(temp_file.name, audio_np, 16000)
        segments, _ = model.transcribe(temp_file.name, language="en")
        transcription = " ".join([seg.text.strip() for seg in segments]).strip()
        return transcription

# Simple test function
def test_transcribe():
    # Create a known audio file for testing or use an existing one
    test_file = "test_audio.wav"  # Replace with a test file path
    try:
        audio_data, sample_rate = sf.read(test_file)
        # Resample if needed
        if sample_rate != 16000:
            print(f"Warning: Audio is {sample_rate}Hz, not 16000Hz")
        
        text = transcribe_audio(audio_data)
        print(f"Transcription result: {text}")
    except Exception as e:
        print(f"Error testing transcription: {e}")
        print("If you don't have a test file, create a recording for testing.")

if __name__ == "__main__":
    test_transcribe()