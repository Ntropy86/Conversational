'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';

// Backend API configuration
const API_URL = 'http://localhost:8000';

// Create context
const AIAgentContext = createContext();

// Sample project data for UI testing - based on the resume context
const sampleProjects = [
  {
    title: "Chicago Crimes Forecasting & Hotspot Analysis",
    date: "Feb 2025",
    technologies: ["ARIMA", "LSTM", "DBSCAN", "PySpark", "AWS EMR", "Plotly"],
    description: "Engineered a hybrid ARIMA-LSTM predictive model that improved crime pattern forecasting accuracy to 85%, enabling law-enforcement to optimize patrol resource allocation and reduce response times. Deployed spatial clustering using DBSCAN to identify crime hotspots across 12 crime categories totaling 10M reports."
  },
  {
    title: "EEG Emotion Classifier",
    date: "Jan 2023",
    technologies: ["ExtraTrees", "SMOTE", "PyTorch", "Signal Processing"],
    description: "Achieved 91% accuracy in classifying emotions from EEG signals using advanced feature extraction and ensemble methods with SMOTE for imbalanced data."
  }
];

// localStorage keys
const CONVERSATION_STORAGE_KEY = 'ai_conversation_history';
const SESSION_ID_KEY = 'ai_session_id';

export function AIAgentProvider({ children }) {
  const [isAIMode, setIsAIMode] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isAIResponding, setIsAIResponding] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [audioProcessing, setAudioProcessing] = useState(false);
  
  // Load conversation from localStorage on mount
  useEffect(() => {
    try {
      const storedConversation = localStorage.getItem(CONVERSATION_STORAGE_KEY);
      const storedSessionId = localStorage.getItem(SESSION_ID_KEY);
      
      if (storedConversation) {
        const parsedConversation = JSON.parse(storedConversation);
        setConversation(parsedConversation);
      }
      
      if (storedSessionId) {
        setSessionId(storedSessionId);
      }
    } catch (error) {
      console.error('Error loading conversation from localStorage:', error);
    }
  }, []);
  
  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    try {
      if (conversation.length > 0) {
        localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(conversation));
      }
    } catch (error) {
      console.error('Error saving conversation to localStorage:', error);
    }
  }, [conversation]);
  
  // Save sessionId to localStorage whenever it changes
  useEffect(() => {
    try {
      if (sessionId) {
        localStorage.setItem(SESSION_ID_KEY, sessionId);
      }
    } catch (error) {
      console.error('Error saving sessionId to localStorage:', error);
    }
  }, [sessionId]);
  
  // Check backend connection
  const checkBackendConnection = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(API_URL, { 
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setIsBackendConnected(true);
        return true;
      } else {
        setIsBackendConnected(false);
        return false;
      }
    } catch (error) {
      console.error('Error connecting to backend:', error);
      setIsBackendConnected(false);
      return false;
    }
  };

  // Create a new backend session
  const createSession = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${API_URL}/session/create`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status}`);
      }
      
      const data = await response.json();
      setSessionId(data.session_id);
      return data.session_id;
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  };

  // Ensure we have a valid session
  const ensureSession = async () => {
    if (sessionId) {
      return sessionId;
    }
    return await createSession();
  };

  // Initialize backend connection when component mounts
  useEffect(() => {
    const initializeBackend = async () => {
      const connected = await checkBackendConnection();
      if (connected) {
        await createSession();
      }
    };
    
    initializeBackend();
  }, []);

  // Toggle between normal and AI agent mode
  const toggleAIMode = () => {
    setIsAIMode(!isAIMode);
  };
  
  // Clear conversation history
  const clearConversation = () => {
    setConversation([]);
    try {
      localStorage.removeItem(CONVERSATION_STORAGE_KEY);
      localStorage.removeItem(SESSION_ID_KEY);
      setSessionId(null);
    } catch (error) {
      console.error('Error clearing conversation from localStorage:', error);
    }
  };
  
  // Placeholder functions for voice input
  const startListening = () => {
    setIsListening(true);
  };
  
  const stopListening = () => {
    setIsListening(false);
  };
  
  // Add user message to conversation
  const addUserMessage = (message) => {
    // Check if this is the first message
    if (conversation.length === 0) {
      // Make the first message a header/title question
      const newConversation = [
        { role: 'user', content: message }
      ];
      setConversation(newConversation);
    } else {
      // Add as a regular message in the conversation
      const newConversation = [
        ...conversation,
        { role: 'user', content: message }
      ];
      setConversation(newConversation);
    }
  };
  
  // Generate AI response using real backend API
  const generateAIResponse = async (userMessage) => {
    if (!isBackendConnected) {
      console.error('Backend not connected');
      return;
    }

    setIsAIResponding(true);
    
    try {
      // Ensure we have a session
      const currentSessionId = await ensureSession();
      if (!currentSessionId) {
        throw new Error('Failed to create session');
      }

      // Send request to backend LLM service with conversation context
      const response = await fetch(`${API_URL}/test/llm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userMessage,
          session_id: currentSessionId,
          conversation_history: conversation.slice(-10) // Send last 10 messages for context
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();
      
      // Handle structured response from backend
      const structuredData = {
        items: result.items || [],
        item_type: result.item_type || 'general',
        metadata: result.metadata || {}
      };

      // Add assistant response to conversation with structured data
      setConversation(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: result.response,
          structuredData: structuredData
        }
      ]);

    } catch (error) {
      console.error('Error generating AI response:', error);
      
      // Fallback response
      setConversation(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: "Sorry, I'm having trouble connecting to my brain right now. Try again in a moment!"
        }
      ]);
    }
    
    setIsAIResponding(false);
  };

  // Convert Float32Array to WAV blob (from test app)
  const convertToWav = (audioData, sampleRate) => {
    try {
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
    } catch (error) {
      console.error('Error converting audio to WAV:', error);
      throw error;
    }
  };
  
  // Helper to write strings to DataView
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Process audio through full backend pipeline
  const processAudioData = async (audioData) => {
    if (!audioData || audioData.length === 0) {
      console.error('No audio data to process');
      return null;
    }

    if (!isBackendConnected) {
      console.error('Backend not connected');
      return null;
    }

    setAudioProcessing(true);
    
    try {
      // Ensure we have a session
      const currentSessionId = await ensureSession();
      if (!currentSessionId) {
        throw new Error('Failed to create session');
      }

      console.log(`Processing audio: ${audioData.length} samples with session ${currentSessionId}`);
      
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
      formData.append('session_id', currentSessionId);
      
      console.log('Sending request to backend...');
      
      // Send to backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(`${API_URL}/process`, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      
      if (result.status === 'success') {
        // Handle structured response from audio processing
        const structuredData = {
          items: result.items || [],
          item_type: result.item_type || 'general',
          metadata: result.metadata || {}
        };

        // Add messages to conversation
        setConversation(prev => [
          ...prev, 
          { role: 'user', content: result.transcription },
          { 
            role: 'assistant', 
            content: result.response,
            structuredData: structuredData
          }
        ]);
        
        // Play audio response
        const audio = new Audio(`${API_URL}/audio/${result.audio_file}`);
        
        return new Promise((resolve) => {
          audio.onended = () => {
            setAudioProcessing(false);
            resolve(result);
          };
          
          audio.onerror = (e) => {
            console.error('Audio playback error:', e);
            setAudioProcessing(false);
            resolve(result);
          };
          
          audio.play().catch(playError => {
            console.error('Error playing audio:', playError);
            setAudioProcessing(false);
            resolve(result);
          });
        });
        
      } else {
        console.log('Error from server:', result.message);
        setAudioProcessing(false);
        return null;
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setAudioProcessing(false);
      return null;
    }
  };
  
  return (
    <AIAgentContext.Provider value={{
      isAIMode,
      toggleAIMode,
      conversation,
      isListening,
      startListening,
      stopListening,
      transcript,
      setTranscript,
      isAIResponding,
      addUserMessage,
      generateAIResponse,
      clearConversation,
      sessionId,
      isBackendConnected,
      audioProcessing,
      processAudioData,
      checkBackendConnection
    }}>
      {children}
    </AIAgentContext.Provider>
  );
}

// Custom hook for using AI agent context
export function useAIAgent() {
  return useContext(AIAgentContext);
}