// File: src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const API_URL = 'http://localhost:8000';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('Initializing...');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const messagesEndRef = useRef(null);
  const processingRef = useRef(false);
  
  // Create a session when the app loads
  useEffect(() => {
    createSession();
    
    // Check if backend is available
    fetch(API_URL)
      .then(response => {
        if (response.ok) {
          setIsConnected(true);
          setStatus('Ready');
        }
      })
      .catch(() => {
        setStatus('Cannot connect to backend. Is the server running?');
      });
      
    return () => {
      stopListening();
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

  const startListening = async () => {
    if (isListening || processingRef.current) return;
    
    try {
      // Reset state
      audioChunksRef.current = [];
      processingRef.current = false;
      
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          await processRecording();
        } else {
          processingRef.current = false;
          setStatus('No speech detected. Try again.');
          setTimeout(() => startListening(), 1000);
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsListening(true);
      setStatus('Listening... (speak now)');
      
      // Set a timeout to stop recording after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          console.log('Recording timed out, processing...');
          mediaRecorderRef.current.stop();
        }
      }, 10000);
      
    } catch (error) {
      console.error('Error starting audio:', error);
      setStatus('Error accessing microphone');
      setIsListening(false);
    }
  };
  
  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    setIsListening(false);
    setStatus('Stopped listening');
  };
  
  const processRecording = async () => {
    if (!sessionId || audioChunksRef.current.length === 0) {
      processingRef.current = false;
      return;
    }
    
    try {
      processingRef.current = true;
      setStatus('Processing...');
      
      // Create a blob from the audio chunks
      const audioBlob = new Blob(audioChunksRef.current);
      
      // Create a new file 
      const file = new File([audioBlob], "recording.wav", { 
        type: 'audio/wav',
        lastModified: new Date().getTime()
      });
      
      console.log('Sending file to server:', file.name, file.type, file.size);
      
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
          // Restart listening after response finishes
          processingRef.current = false;
          setStatus('Ready for next question');
          setTimeout(() => startListening(), 500);
        };
        
        audio.onerror = () => {
          console.error('Audio playback error');
          processingRef.current = false;
          setStatus('Error playing response');
          setTimeout(() => startListening(), 1000);
        };
        
        audio.play();
        
      } else {
        console.log('Error from server:', result.message);
        setStatus(`Error: ${result.message}`);
        processingRef.current = false;
        setTimeout(() => startListening(), 2000);
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setStatus('Error processing audio');
      processingRef.current = false;
      setTimeout(() => startListening(), 2000);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>Resume AI Assistant</h1>
        <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
          {status}
        </div>
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
          className={`mic-button ${isListening ? 'listening' : ''} ${processingRef.current ? 'processing' : ''}`}
          onClick={isListening ? stopListening : startListening}
          disabled={processingRef.current}
        >
          {isListening ? (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Stop
            </>
          ) : processingRef.current ? (
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
      
      {/* Debug section */}
      <div className="debug-section" style={{ display: 'none' }}>
        <h3>Debug Info</h3>
        <button onClick={() => {
          if (sessionId) {
            navigator.clipboard.writeText(sessionId);
            alert('Session ID copied to clipboard');
          }
        }}>
          Copy Session ID
        </button>
        <button onClick={() => {
          console.log('Current state:', {
            isListening,
            isProcessing: processingRef.current,
            messageCount: messages.length,
            sessionId
          });
        }}>
          Log State
        </button>
      </div>
    </div>
  );
}

export default App;