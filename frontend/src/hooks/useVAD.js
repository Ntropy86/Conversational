// src/hooks/useVAD.js
import { useState, useEffect, useRef } from 'react';

const useVAD = (options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  
  // Store VAD instance in ref
  const vadRef = useRef(null);
  const scriptRef = useRef(null);
  
  // Load external scripts
  useEffect(() => {
    let mounted = true;
    
    const loadScript = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.vad) {
          console.log('VAD already loaded');
          return resolve();
        }
        
        // Create script element
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort.js';
        script.async = true;
        script.onload = () => {
          console.log('ONNX Runtime loaded');
          
          // Now load VAD script
          const vadScript = document.createElement('script');
          vadScript.src = 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.22/dist/bundle.min.js';
          vadScript.async = true;
          vadScript.onload = () => {
            console.log('VAD script loaded');
            scriptRef.current = vadScript;
            resolve();
          };
          vadScript.onerror = (err) => {
            console.error('Error loading VAD script:', err);
            reject(new Error('Failed to load VAD script'));
          };
          document.body.appendChild(vadScript);
        };
        script.onerror = (err) => {
          console.error('Error loading ONNX Runtime:', err);
          reject(new Error('Failed to load ONNX Runtime'));
        };
        document.body.appendChild(script);
      });
    };
    
    const initVAD = async () => {
      try {
        setIsLoading(true);
        console.log('Loading VAD dependencies...');
        
        // Load scripts
        await loadScript();
        
        if (!mounted) return;
        
        console.log('Initializing VAD...');
        
        // Check if window.vad is available
        if (!window.vad || !window.vad.MicVAD) {
          throw new Error('VAD library not loaded - window.vad.MicVAD not available');
        }
        
        // Initialize VAD with options
        vadRef.current = await window.vad.MicVAD.new({
          positiveSpeechThreshold: options.positiveSpeechThreshold || 0.8,
          negativeSpeechThreshold: options.negativeSpeechThreshold || 0.2,
          minSpeechFrames: options.minSpeechFrames || 3,
          redemptionFrames: options.redemptionFrames || 10,
          onSpeechStart: () => {
            console.log('🎤 Speech started');
            setIsSpeaking(true);
            
            // Play start beep (higher pitch)
            try {
              const beepStart = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDq2H8bQpAaK7D2qpjVjZgXHa0rpdndjIhMk3FnmEi2/7V4a7D2qtxCEC0dXJOSLGv9nHUejSWbjPV0/OKaGjOG0DfcLFHFjdxCEZ1ZFJWvhqHqHNOwEG5iK67W9Pm2eHHxkGhvkPFwDJk2f+Rq7DA8RhA39DdcKJbpxJnCEqAbqB3hL6FnkfUq8iKZnzLf6Z9S8TuSRBLwFB4jRY9Zt31ijZlP4Z1kA==");
              beepStart.volume = 0.3;
              beepStart.play().catch(e => console.log('Could not play start beep:', e));
            } catch (e) {
              console.log('Error creating start beep:', e);
            }
            
            if (options.onSpeechStart) options.onSpeechStart();
          },
          onSpeechEnd: (audio) => {
            console.log('🔇 Speech ended -', audio.length, 'samples');
            console.log('Audio data type:', typeof audio, 'Constructor:', audio.constructor.name);
            setIsSpeaking(false);
            
            // Play end beep (lower pitch)
            try {
              const beepEnd = new Audio("data:audio/wav;base64,UklGRvoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDq2H8bQpAaK7D2qpjVjZgXHa0rpdndjIhMk3FnmEi2/7V4a7D2qtxCEC0dXJOSLGv9nHUejSWbjPV0/OKaGjOG0DfcLFHFjdxCEZ1ZFJWvhqHqHNOwEG5iK67W9Pm2eHHxkGhvkPFwDJk2f+Rq7DA8RhA29DdcKJbpxJnCEqAbqB3hL6FnkfUq8iKZnzLf6Z9S8TuSRBLwFB4jRY5Zt31ijZlP5Z1kA==");
              beepEnd.volume = 0.3;
              beepEnd.play().catch(e => console.log('Could not play end beep:', e));
            } catch (e) {
              console.log('Error creating end beep:', e);
            }
            
            if (options.onSpeechEnd) options.onSpeechEnd(audio);
          },
          onVADMisfire: () => {
            console.log('❌ VAD misfire (too short)');
            setIsSpeaking(false);
            if (options.onVADMisfire) options.onVADMisfire();
          }
        });
        
        // VAD initialized successfully
        setIsLoaded(true);
        setIsLoading(false);
        console.log('VAD initialized successfully!');
        console.log('VAD methods:', Object.keys(vadRef.current));
      } catch (err) {
        if (!mounted) return;
        
        console.error('Error initializing VAD:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    initVAD();
    
    return () => {
      mounted = false;
      // Clean up using proper method
      if (vadRef.current && typeof vadRef.current.destroy === 'function') {
        vadRef.current.destroy();
      }
    };
  }, []);
  
  // Toggle function for start/stop
  const toggle = (shouldListen) => {
    try {
      if (!vadRef.current) {
        console.error('❌ VAD not initialized');
        return false;
      }
      
      console.log('🔧 VAD methods available:', Object.keys(vadRef.current));
      
      if (shouldListen && !isListening) {
        // Start listening
        console.log('▶️ Starting VAD listening...');
        vadRef.current.start();
        setIsListening(true);
        console.log('✅ VAD listening started');
        return true;
      } else if (!shouldListen && isListening) {
        // Stop listening - check available methods first
        console.log('⏸️ Stopping VAD listening...');
        
        // The correct method name might be different
        if (typeof vadRef.current.pause === 'function') {
          console.log('Using pause() method');
          vadRef.current.pause();
        } else if (typeof vadRef.current.stop === 'function') {
          console.log('Using stop() method');
          vadRef.current.stop();
        } else if (typeof vadRef.current.destroy === 'function') {
          console.log('Using destroy() method');
          vadRef.current.destroy();
        } else {
          console.warn('No stop/pause method found, available methods:', Object.keys(vadRef.current));
        }
        
        setIsListening(false);
        console.log('✅ VAD listening stopped');
        return true;
      }
      
      console.log('ℹ️ VAD already in desired state');
      return true; // Already in desired state
    } catch (err) {
      console.error('❌ Error toggling VAD:', err);
      setError(err.message);
      return false;
    }
  };
  
  return {
    isLoaded,
    isLoading,
    isListening,
    isSpeaking,
    error,
    toggle
  };
};

export default useVAD;