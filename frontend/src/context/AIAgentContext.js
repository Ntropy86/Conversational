'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';

// Backend API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  const [showContactPopup, setShowContactPopup] = useState(false);
  
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
  
  // Generate AI response using smart progressive system
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

      // Get user_id from localStorage or generate new one
      let userId = localStorage.getItem('ai_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('ai_user_id', userId);
      }

      // Send request to smart endpoint for immediate response
      const response = await fetch(`${API_URL}/smart/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userMessage,
          session_id: currentSessionId,
          conversation_history: conversation.slice(-10), // Send last 10 messages for context
          user_id: userId
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const result = await response.json();
      
      // Check if response suggests consultation
      const needsConsultation = result.response && result.response.toLowerCase().includes("let's set up a consultation");
      const isConsultationType = result.item_type === "consultation";
      
      if (needsConsultation || isConsultationType) {
        console.log('🎯 Triggering contact popup - response includes consultation request');
        setShowContactPopup(true);
      }
      
      // Handle immediate response (NLP-based)
      const structuredData = {
        items: result.items || [],
        item_type: result.item_type || 'general',
        metadata: result.metadata || {}
      };

      // Add immediate response to conversation with structured data
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setConversation(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: result.response,
          structuredData: structuredData,
          messageId: messageId,
          enhancementPending: result.llm_enhancement?.status === 'pending'
        }
      ]);

      // Start background enhancement if available
      if (result.llm_enhancement && result.llm_enhancement.status === 'pending') {
        checkForEnhancement(result.llm_enhancement.task_id, messageId);
      }

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

  // Check for background LLM enhancement
  const checkForEnhancement = async (taskId, messageId) => {
    try {
      // Poll for enhancement with exponential backoff
      const maxAttempts = 6; // ~30 seconds total (1+2+4+8+15s)
      let attempt = 0;
      
      while (attempt < maxAttempts) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 15000); // Cap at 15 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
        
        try {
          const enhancementResponse = await fetch(`${API_URL}/smart/enhancement/${taskId}`);
          
          if (enhancementResponse.status === 404 || enhancementResponse.status === 410) {
            console.log('Enhancement task not found or expired');
            break;
          }
          
          if (!enhancementResponse.ok) {
            attempt++;
            continue;
          }
          
          const enhancementResult = await enhancementResponse.json();
          
          if (enhancementResult.status === 'completed' && enhancementResult.result) {
            // Update the conversation with enhanced response
            setConversation(prev => prev.map(msg => 
              msg.messageId === messageId 
                ? {
                    ...msg,
                    content: enhancementResult.result.response,
                    structuredData: {
                      items: enhancementResult.result.items || [],
                      item_type: enhancementResult.result.item_type || 'general',
                      metadata: enhancementResult.result.metadata || {}
                    },
                    enhancementPending: false,
                    enhanced: true
                  }
                : msg
            ));
            break;
          } else if (enhancementResult.status === 'failed' || enhancementResult.status === 'timeout') {
            console.log('Enhancement failed or timed out, keeping original response');
            // Mark as no longer pending
            setConversation(prev => prev.map(msg => 
              msg.messageId === messageId 
                ? { ...msg, enhancementPending: false }
                : msg
            ));
            break;
          }
          
          attempt++;
        } catch (pollError) {
          console.error('Error polling for enhancement:', pollError);
          attempt++;
        }
      }
      
      // If we exhausted all attempts, mark as no longer pending
      setConversation(prev => prev.map(msg => 
        msg.messageId === messageId 
          ? { ...msg, enhancementPending: false }
          : msg
      ));
      
    } catch (error) {
      console.error('Error in background enhancement:', error);
    }
  };

  // Convert Float32Array to WAV blob (from test app)
  const convertToWav = (audioData, sampleRate) => {
    try {
      console.log('🔧 convertToWav input validation:', {
        hasData: !!audioData,
        length: audioData?.length,
        sampleRate,
        type: typeof audioData,
        constructor: audioData?.constructor?.name
      });
      
      if (!audioData || !audioData.length) {
        throw new Error('No audio data provided');
      }
      
      if (!(audioData instanceof Float32Array)) {
        console.warn('⚠️ Audio data is not Float32Array, converting...');
        audioData = new Float32Array(audioData);
      }
      
      const numChannels = 1;
      const bytesPerSample = 2; // 16-bit PCM
      const blockAlign = numChannels * bytesPerSample;
      const buffer = new ArrayBuffer(44 + audioData.length * bytesPerSample);
      const view = new DataView(buffer);
      
      console.log(`🏗️ Creating WAV: ${audioData.length} samples → ${buffer.byteLength} bytes`);
      
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

  // Process audio through unified pipeline (same as text after transcription)
  const processAudioData = async (audioData) => {
    console.log('🎵 processAudioData called with:', {
      hasData: !!audioData,
      length: audioData?.length,
      type: typeof audioData,
      constructor: audioData?.constructor?.name
    });

    if (!audioData || audioData.length === 0) {
      console.error('❌ No audio data to process');
      return null;
    }

    if (!isBackendConnected) {
      console.error('❌ Backend not connected');
      return null;
    }

    console.log('🔄 Setting audioProcessing to true...');
    setAudioProcessing(true);
    
    try {
      // Ensure we have a session
      const currentSessionId = await ensureSession();
      if (!currentSessionId) {
        throw new Error('Failed to create session');
      }

      console.log(`🔄 Processing audio: ${audioData.length} samples with session ${currentSessionId}`);
      console.log(`🎤 Audio duration: ${(audioData.length / 16000).toFixed(2)} seconds`);
      
      // Step 1: Convert audio to transcription only
      console.log('📝 Converting audio to WAV format...');
      const wavBlob = convertToWav(audioData, 16000);
      console.log(`📦 WAV blob created: ${wavBlob.size} bytes`);
      
      // Create file from blob
      console.log('📁 Creating file from blob...');
      const file = new File([wavBlob], "recording.wav", { 
        type: 'audio/wav',
        lastModified: Date.now()
      });
      console.log(`📄 File created: ${file.name}, size: ${file.size} bytes`);
      
      // Create form data for transcription only
      console.log('📋 Creating form data for transcription...');
      const formData = new FormData();
      formData.append('audio_file', file);
      formData.append('session_id', currentSessionId);
      
      console.log('📤 Sending transcription request to backend...');
      
      // Send to test transcription endpoint (transcription only)
      console.log('⏰ Setting up transcription request with 30s timeout...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Transcription timeout reached, aborting...');
        controller.abort();
      }, 30000);
      
      console.log('🌐 Making transcription fetch request...');
      const transcriptionResponse = await fetch(`${API_URL}/test/transcribe`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      console.log('📨 Transcription request completed');
      
      console.log(`📥 Transcription response: ${transcriptionResponse.status} ${transcriptionResponse.statusText}`);
      
      if (!transcriptionResponse.ok) {
        const errorText = await transcriptionResponse.text();
        console.error('❌ Transcription error response:', errorText);
        throw new Error(`Transcription error: ${transcriptionResponse.status} - ${errorText}`);
      }
      
      const transcriptionResult = await transcriptionResponse.json();
      console.log('✅ Transcription result:', transcriptionResult);
      
      if (!transcriptionResult.transcription) {
        throw new Error('Failed to get transcription from audio');
      }
      
      const userMessage = transcriptionResult.transcription;
      console.log(`🎯 Transcribed text: "${userMessage}"`);
      
      // Step 2: Add user message to conversation immediately
      setConversation(prev => [
        ...prev,
        { role: 'user', content: userMessage }
      ]);
      
      // Step 3: Process through the same smart pipeline as text input
      console.log('🧠 Processing through smart pipeline (same as text)...');
      
      // Get user_id from localStorage or generate new one
      let userId = localStorage.getItem('ai_user_id');
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('ai_user_id', userId);
      }

      // Use the same smart endpoint as text input
      const smartResponse = await fetch(`${API_URL}/smart/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: userMessage,
          session_id: currentSessionId,
          conversation_history: conversation.slice(-10), // Send last 10 messages for context
          user_id: userId
        })
      });

      if (!smartResponse.ok) {
        throw new Error(`Smart endpoint error: ${smartResponse.status}`);
      }

      const smartResult = await smartResponse.json();
      console.log('✅ Smart pipeline result:', smartResult);
      
      // Check if response suggests consultation
      const needsConsultation = smartResult.response && smartResult.response.toLowerCase().includes("let's set up a consultation");
      const isConsultationType = smartResult.item_type === "consultation";
      
      if (needsConsultation || isConsultationType) {
        console.log('🎯 Triggering contact popup - voice response includes consultation request');
        setShowContactPopup(true);
      }
      
      // Handle response with structured data (same as text)
      const structuredData = {
        items: smartResult.items || [],
        item_type: smartResult.item_type || 'general',
        metadata: smartResult.metadata || {}
      };

      // Add AI response to conversation with structured data and enhancement support
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setConversation(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: smartResult.response,
          structuredData: structuredData,
          messageId: messageId,
          enhancementPending: smartResult.llm_enhancement?.status === 'pending'
        }
      ]);

      // Start background enhancement if available (same as text)
      if (smartResult.llm_enhancement && smartResult.llm_enhancement.status === 'pending') {
        checkForEnhancement(smartResult.llm_enhancement.task_id, messageId);
      }

      // Step 4: Generate and play audio response
      console.log('🔊 Generating audio response...');
      try {
        const ttsResponse = await fetch(`${API_URL}/test/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: smartResult.response,
            session_id: currentSessionId
          })
        });
        
        if (ttsResponse.ok) {
          // /test/tts returns audio file directly, not JSON
          const audioBlob = await ttsResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log(`🔊 Playing AI response audio from blob`);
          const audio = new Audio(audioUrl);
          
          return new Promise((resolve) => {
            audio.onended = () => {
              console.log('✅ Voice response audio playback completed');
              URL.revokeObjectURL(audioUrl); // Clean up blob URL
              setAudioProcessing(false);
              resolve(smartResult);
            };
            
            audio.onerror = (e) => {
              console.error('❌ Voice response audio playback error:', e);
              URL.revokeObjectURL(audioUrl); // Clean up blob URL
              setAudioProcessing(false);
              resolve(smartResult);
            };
            
            audio.play().catch(playError => {
              console.error('❌ Error playing voice response audio:', playError);
              URL.revokeObjectURL(audioUrl); // Clean up blob URL
              setAudioProcessing(false);
              resolve(smartResult);
            });
          });
        }
      } catch (ttsError) {
        console.warn('⚠️ TTS generation failed, continuing without audio:', ttsError);
      }
      
      // If no audio or TTS failed, just finish processing
      console.log('✅ Voice processing completed (no audio response)');
      setAudioProcessing(false);
      return smartResult;
      
    } catch (error) {
      console.error('❌ Error processing audio:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        toString: error.toString()
      });
      
      let fallbackResponse = "Hmm, something went wrong. Maybe try asking again?";
      
      if (error.name === 'AbortError') {
        console.error('🚫 Request was aborted (timeout or user cancel)');
        fallbackResponse = "Wow, either you got rate-limited or my brain just took a coffee break. Try again in a sec?";
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🌐 Network error - backend might be down');
        fallbackResponse = "Looks like I lost connection to my brain. Is the backend still running?";
      }
      
      // Add the error response to conversation
      setConversation(prev => [
        ...prev,
        { role: 'assistant', content: fallbackResponse, isError: true }
      ]);
      
      // Generate and play audio for the fallback response
      try {
        console.log('🔊 Generating fallback audio response...');
        const ttsResponse = await fetch(`${API_URL}/test/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: fallbackResponse })
        });
        
        if (ttsResponse.ok) {
          const audioBlob = await ttsResponse.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log('🎵 Playing fallback audio...');
          const audio = new Audio(audioUrl);
          audio.onended = () => URL.revokeObjectURL(audioUrl);
          audio.onerror = () => URL.revokeObjectURL(audioUrl);
          audio.play().catch(audioError => {
            console.error('Failed to play fallback audio:', audioError);
            URL.revokeObjectURL(audioUrl);
          });
        }
      } catch (ttsError) {
        console.warn('Failed to generate fallback audio:', ttsError);
      }
      
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
      checkBackendConnection,
      showContactPopup,
      setShowContactPopup
    }}>
      {children}
    </AIAgentContext.Provider>
  );
}

// Custom hook for using AI agent context
export function useAIAgent() {
  return useContext(AIAgentContext);
}