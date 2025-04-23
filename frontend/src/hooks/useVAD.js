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
        
        // Initialize VAD with options
        vadRef.current = await window.vad.MicVAD.new({
          positiveSpeechThreshold: options.positiveSpeechThreshold || 0.8,
          negativeSpeechThreshold: options.negativeSpeechThreshold || 0.2,
          minSpeechFrames: options.minSpeechFrames || 3,
          redemptionFrames: options.redemptionFrames || 10,
          onSpeechStart: () => {
            console.log('Speech started');
            setIsSpeaking(true);
            if (options.onSpeechStart) options.onSpeechStart();
          },
          onSpeechEnd: (audio) => {
            console.log('Speech ended', audio.length, 'samples');
            setIsSpeaking(false);
            if (options.onSpeechEnd) options.onSpeechEnd(audio);
          },
          onVADMisfire: () => {
            console.log('VAD misfire (too short)');
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
        console.error('VAD not initialized');
        return false;
      }
      
      console.log('VAD methods:', Object.keys(vadRef.current));
      
      if (shouldListen && !isListening) {
        // Start listening
        console.log('Starting VAD...');
        vadRef.current.start();
        setIsListening(true);
        return true;
      } else if (!shouldListen && isListening) {
        // Stop listening - check available methods first
        console.log('Stopping VAD...');
        
        // The correct method name might be different
        if (typeof vadRef.current.pause === 'function') {
          vadRef.current.pause();
        } else if (typeof vadRef.current.destroy === 'function') {
          vadRef.current.destroy();
        }
        
        setIsListening(false);
        return true;
      }
      
      return true; // Already in desired state
    } catch (err) {
      console.error('Error toggling VAD:', err);
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