export GROQ_API_KEY=your_key_here

Testing:
# Run these in separate terminal sessions

# Test VAD (Voice Activity Detection)
python vad_service.py

# Test Transcription
python transcribe_service.py

# Test LLM
python llm_service.py

# Test TTS
python tts_service.py


Test Script:
# First, install additional dependencies for the test script
pip install requests pydub sounddevice

# Test VAD with a recorded audio file
python test_components.py vad --audio sample.wav

# Record and test transcription
python test_components.py transcribe --record

# Test LLM
python test_components.py llm --text "Tell me about your projects"

# Test TTS
python test_components.py tts --text "Hello, this is a test of the text to speech system"

# Test the full pipeline with an audio file
python test_components.py full --audio sample.wav


If you want to run the backend and test it using cURL commands:
# Record a test audio file if you don't have one
# You can use your vad_service.py to record
python -c "from vad_service import record_until_silence; import soundfile as sf; audio=record_until_silence(); sf.write('test_recording.wav', audio, 16000)"