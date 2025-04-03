// src/hooks/useVAD.js
import { useState, useEffect, useRef, useCallback } from 'react';

const useVAD = (options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  
  const vadRef = useRef(null);
  const scriptsLoadedRef = useRef(false);

  const {
    onSpeechStart,
    onSpeechEnd,
    onVADMisfire,
    positiveSpeechThreshold = 0.8,
    negativeSpeechThreshold = 0.2,
    minSpeechFrames = 3,
    redemptionFrames = 10
  } = options;

  // Load required scripts
  useEffect(() => {
    if (scriptsLoadedRef.current) return;
    
    const loadScripts = async () => {
      try {
        // Load ONNX Runtime first
        await loadScript('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.14.0/dist/ort.js');
        // Then load VAD
        await loadScript('https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.22/dist/bundle.min.js');
        
        scriptsLoadedRef.current = true;
        
        // Initialize VAD
        initVAD();
      } catch (err) {
        console.error('Failed to load VAD scripts:', err);
        setError('Failed to load speech detection model');
        setIsLoading(false);
      }
    };
    
    loadScripts();
    
    return () => {
      // Cleanup
      if (vadRef.current) {
        try {
          vadRef.current.stop();
        } catch (e) {
          console.error('Error stopping VAD:', e);
        }
        vadRef.current = null;
      }
    };
  }, []);

  // Initialize VAD once scripts are loaded
  const initVAD = useCallback(async () => {
    try {
      if (!window.vad) {
        throw new Error('VAD library not loaded');
      }
      
      setIsLoading(true);
      
      vadRef.current = await window.vad.MicVAD.new({
        positiveSpeechThreshold,
        negativeSpeechThreshold,
        minSpeechFrames,
        redemptionFrames,
        onSpeechStart: () => {
          setIsSpeaking(true);
          if (onSpeechStart) onSpeechStart();
        },
        onSpeechEnd: (audio) => {
          setIsSpeaking(false);
          if (onSpeechEnd) onSpeechEnd(audio);
        },
        onVADMisfire: () => {
          setIsSpeaking(false);
          if (onVADMisfire) onVADMisfire();
        }
      });
      
      setIsLoaded(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing VAD:', err);
      setError(`Error initializing speech detection: ${err.message}`);
      setIsLoading(false);
    }
  }, [onSpeechStart, onSpeechEnd, onVADMisfire, positiveSpeechThreshold, negativeSpeechThreshold, minSpeechFrames, redemptionFrames]);

  // Function to start/stop listening
  const toggle = useCallback((listen = true) => {
    if (!vadRef.current || !isLoaded) return false;
    
    try {
      if (listen) {
        vadRef.current.start();
        setIsListening(true);
      } else {
        vadRef.current.stop();
        setIsListening(false);
        setIsSpeaking(false);
      }
      return true;
    } catch (err) {
      console.error('Error toggling VAD:', err);
      setError(`Error with speech detection: ${err.message}`);
      return false;
    }
  }, [isLoaded]);

  // Helper to load scripts
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      
      document.head.appendChild(script);
    });
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