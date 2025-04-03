#!/bin/bash
BASE_URL="http://localhost:8000"

# Create a new session
echo "Creating a new session..."
SESSION_RESPONSE=$(curl -s -X POST "${BASE_URL}/session/create")
echo $SESSION_RESPONSE
SESSION_ID=$(echo $SESSION_RESPONSE | grep -o '"session_id":"[^"]*' | cut -d'"' -f4)
echo "Session ID: $SESSION_ID"
echo

# Test Transcription with an audio file
echo "Testing Transcription..."
curl -s -X POST "${BASE_URL}/test/transcribe" \
  -F "audio_file=@test_recording.wav"
echo
echo

# Test LLM with text input
echo "Testing LLM..."
curl -s -X POST "${BASE_URL}/test/llm" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"Tell me about your Chicago Crime Forecasting project\", \"session_id\": \"$SESSION_ID\"}"
echo
echo

# Test TTS with text input
echo "Testing TTS..."
echo "Running TTS test - response saved to tts_test.wav"
curl -s -X POST "${BASE_URL}/test/tts" \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"I'm excited to tell you about my Chicago Crime Forecasting project that used ARIMA, LSTM, and DBSCAN with Plotly visualizations.\"}" \
  -o tts_test.wav
echo "TTS audio saved to tts_test.wav"
echo

# Test Full Pipeline with an audio file
echo "Testing Full Pipeline..."
curl -s -X POST "${BASE_URL}/process" \
  -F "audio_file=@test_recording.wav" \
  -F "session_id=$SESSION_ID"
echo
echo

echo "Tests completed!"