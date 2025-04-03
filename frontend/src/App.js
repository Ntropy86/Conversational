// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import useVAD from './hooks/useVAD';

const API_URL = 'http://localhost:8000';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Initializing...');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Refs
  const messagesEndRef = useRef(null);
  
  // VAD hook
  const vad = useVAD({
    positiveSpeechThreshold: 0.8,
    negativeSpeechThreshold: 0.2,
    minSpeechFrames: 3,
    redemptionFrames: 10,
    onSpeechStart: () => {
      console.log('Speech started');
      setStatus('Listening to you...');
    },
    onSpeechEnd: (audio) => {
      console.log('Speech ended, processing...');
      setStatus('Processing your message...');
      setIsProcessing(true);
      processAudio(audio);
    },
    onVADMisfire: () => {
      console.log('VAD misfire');
      setStatus(isConnected ? 'Ready' : 'Cannot connect to backend');
      setIsProcessing(false);
    }
  });

  // Initialize session and check backend
  useEffect(() => {
    checkBackendConnection();
    createSession();
    
    return () => {
      // Cleanup
      if (vad.isListening) {
        vad.toggle(false);
      }
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if backend is available
  const checkBackendConnection = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        setIsConnected(true);
        setStatus(vad.isLoading ? 'Loading speech detection...' : 'Ready');
      } else {
        setIsConnected(false);
        setStatus('Cannot connect to backend. Is the server running?');
      }
    } catch (error) {
      console.error('Error connecting to backend:', error);
      setIsConnected(false);
      setStatus('Cannot connect to backend. Is the server running?');
    }
  };

  const createSession = async () => {
    try {
      const response = await fetch(`${API_URL}/session/create`, {
        method: 'POST',
      });
      const data = await response.json();
      setSessionId(data.session_id);
      console.log('Session created:', data.session_id);
    } catch (error) {
      console.error('Error creating session:', error);
      setStatus('Error creating session. Please refresh.');
    }
  };

  const startListening = () => {
    if (vad.isLoading || isProcessing) return;
    
    vad.toggle(true);
    setStatus('Listening... (speak now)');
  };
  
  const stopListening = () => {
    if (!vad.isListening) return;
    
    vad.toggle(false);
    setStatus(isConnected ? 'Ready' : 'Cannot connect to backend');
  };
  
  const processAudio = async (audioData) => {
    if (!sessionId || !audioData || audioData.length === 0) {
      setIsProcessing(false);
      setStatus(isConnected ? 'Ready' : 'Cannot connect to backend');
      return;
    }
    
    try {
      // Convert Float32Array to WAV format
      const wavBlob = convertToWav(audioData, 16000);
      
      // Create file from blob
      const file = new File([wavBlob], "recording.wav", { 
        type: 'audio/wav',
        lastModified: Date.now()
      });
      
      // Create form data
      const formData = new FormData();
      formData.append('audio_file', file);
      formData.append('session_id', sessionId);
      
      // Send to backend
      const response = await fetch(`${API_URL}/process`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        console.error('Server error:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error details:', errorText);
        throw new Error(`Server error: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Processing result:', result);
      
      if (result.status === 'success') {
        // Add messages to conversation
        setMessages(prev => [
          ...prev, 
          { role: 'user', content: result.transcription },
          { role: 'assistant', content: result.response }
        ]);
        
        // Play audio response
        const audio = new Audio(`${API_URL}/audio/${result.audio_file}`);
        
        audio.onended = () => {
          // Ready for next interaction
          setIsProcessing(false);
          setStatus(isConnected ? 'Ready' : 'Cannot connect to backend');
        };
        
        audio.onerror = () => {
          console.error('Audio playback error');
          setIsProcessing(false);
          setStatus('Error playing response');
        };
        
        audio.play();
        
      } else {
        console.log('Error from server:', result.message);
        setStatus(`Error: ${result.message}`);
        setIsProcessing(false);
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setStatus('Error processing audio');
      setIsProcessing(false);
    }
  };

  // Convert Float32Array to WAV blob
  const convertToWav = (audioData, sampleRate) => {
    const numChannels = 1;
    const bytesPerSample = 2; // 16-bit PCM
    const blockAlign = numChannels * bytesPerSample;
    const buffer = new ArrayBuffer(44 + audioData.length * bytesPerSample);
    const view = new DataView(buffer);
    
    // Write WAV header
    // "RIFF" chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + audioData.length * bytesPerSample, true);
    writeString(view, 8, 'WAVE');
    
    // "fmt " sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // subchunk size
    view.setUint16(20, 1, true); // PCM format
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true); // byte rate
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 8 * bytesPerSample, true); // bits per sample
    
    // "data" sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, audioData.length * bytesPerSample, true);
    
    // Write audio data
    const volume = 0.8;
    let offset = 44;
    for (let i = 0; i < audioData.length; i++, offset += 2) {
      const sample = Math.max(-1, Math.min(1, audioData[i] * volume));
      const sampleValue = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(offset, sampleValue, true);
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  };
  
  // Helper to write strings to DataView
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Resume AI Assistant</h1>
        <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {status}
        </div>
        {vad.isLoading && <div className="loading-indicator">Loading speech detection...</div>}
        {vad.error && <div className="error-message">{vad.error}</div>}
      </header>

      <div className="conversation-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <p>Press the microphone button and ask about Nitigya's skills, projects, or experience!</p>
          </div>
        )}
        
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              <strong>{message.role === 'user' ? 'You' : 'Assistant'}:</strong> {message.content}
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="controls-container">
        <button
          className={`mic-button ${vad.isSpeaking ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
          onClick={vad.isListening ? stopListening : startListening}
          disabled={vad.isLoading || isProcessing || !isConnected || !vad.isLoaded}
        >
          {vad.isListening ? (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Stop
            </>
          ) : isProcessing ? (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 19V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Start Conversation
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default App;