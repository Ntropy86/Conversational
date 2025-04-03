# vad_service.py
import torch
import torch.hub
import numpy as np
import queue
import sounddevice as sd
import threading

# VAD parameters
SAMPLE_RATE = 16000
BLOCK_DURATION = 0.25  # seconds
VAD_THRESHOLD = 0.5
VAD_SILENCE_CHUNKS = 5  # Number of silent chunks to consider speech ended

print("Loading Silero VAD...")
vad_model, utils = torch.hub.load("snakers4/silero-vad", "silero_vad", trust_repo=True)
print("VAD model loaded successfully")

audio_queue = queue.Queue()

def audio_callback(indata, frames, time, status):
    """Callback for sounddevice to capture audio"""
    if status:
        print("audio stream:", status)
    audio_queue.put(indata.copy())

def record_until_silence():
    """Record audio until silence is detected after speech"""
    silence_count = 0
    recording = []
    started = False
    
    # Create audio stream
    with sd.InputStream(
        samplerate=SAMPLE_RATE,
        blocksize=int(SAMPLE_RATE * BLOCK_DURATION),
        channels=1,
        callback=audio_callback
    ):
        print("Listening... (press Ctrl+C to stop)")
        try:
            while True:
                # Get audio block from queue
                audio_block = audio_queue.get()
                samples = audio_block[:, 0]  # Get first channel
                
                # Process chunks for VAD
                for i in range(0, len(samples) - 512 + 1, 512):
                    chunk = samples[i:i + 512]
                    audio_tensor = torch.tensor(chunk).unsqueeze(0)
                    prob = vad_model(audio_tensor, SAMPLE_RATE).item()
                    
                    # Check if speech detected
                    if prob > VAD_THRESHOLD:
                        if not started:
                            print("Speech started")
                            started = True
                        recording.extend(chunk.tolist())
                        silence_count = 0
                    elif started:
                        # Count silent chunks after speech started
                        silence_count += 1
                        recording.extend(chunk.tolist())
                        
                        # End recording if enough silence detected
                        if silence_count > VAD_SILENCE_CHUNKS:
                            print("Speech ended")
                            return np.array(recording, dtype=np.float32)
        except KeyboardInterrupt:
            print("Stopped listening")
            if started and recording:
                return np.array(recording, dtype=np.float32)
            return np.array([], dtype=np.float32)

# Test function
def test_vad_interactive():
    """Test VAD with live microphone input"""
    print("Testing VAD with microphone input")
    print("Start speaking, and it will detect when you stop...")
    
    # Record until silence
    audio_data = record_until_silence()
    
    if len(audio_data) > 0:
        print(f"Recorded {len(audio_data)/SAMPLE_RATE:.2f} seconds of audio")
        import soundfile as sf
        sf.write("vad_test_recording.wav", audio_data, SAMPLE_RATE)
        print("Audio saved to 'vad_test_recording.wav'")
    else:
        print("No speech detected or recording interrupted")

if __name__ == "__main__":
    test_vad_interactive()