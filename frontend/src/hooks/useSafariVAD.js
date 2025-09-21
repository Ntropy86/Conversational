// src/hooks/useSafariVAD.js - Safari-compatible VAD fallback
import { useState, useEffect, useRef } from 'react';

const useSafariVAD = (options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState(null);
  
  // Audio processing refs
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const microphoneRef = useRef(null);
  const audioBufferRef = useRef(null);
  const animationFrameRef = useRef(null);
  const recordingRef = useRef(null);
  
  // VAD state
  const speechStartTimeRef = useRef(null);
  const speechEndTimeRef = useRef(null);
  const isSpeakingRef = useRef(false);
  const audioChunksRef = useRef([]);
  
  // Configuration
  const config = {
    // Audio settings
    sampleRate: 16000,
    // VAD thresholds (lower for Safari)
    volumeThreshold: options.volumeThreshold || 0.01,
    frequencyThreshold: options.frequencyThreshold || 0.02,
    // Timing settings
    minSpeechDuration: options.minSpeechDuration || 500, // ms
    maxSilenceDuration: options.maxSilenceDuration || 800, // ms
    // Audio quality
    bufferSize: 4096,
    ...options
  };

  // Detect Safari
  const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
  };

  // Initialize Safari-compatible VAD
  useEffect(() => {
    let mounted = true;
    
    // Don't initialize if disabled
    if (options.disabled) {
      setIsLoading(false);
      setIsLoaded(false);
      return;
    }
    
    const initSafariVAD = async () => {
      try {
        setIsLoading(true);
        console.log('🧭 Initializing Safari-compatible VAD...');
        
        // Request microphone permission first
        console.log('🎤 Requesting microphone permission...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: config.sampleRate
          }
        });
        
        if (!mounted) return;
        
        mediaStreamRef.current = stream;
        console.log('✅ Microphone permission granted');
        
        // Create AudioContext with Safari compatibility
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContextClass({
          sampleRate: config.sampleRate
        });
        
        // Safari requires user interaction to start AudioContext
        if (audioContextRef.current.state === 'suspended') {
          console.log('⏳ AudioContext suspended, will resume on user interaction');
        }
        
        // Create analyser node
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 2048;
        analyserRef.current.smoothingTimeConstant = 0.8;
        
        // Create microphone source
        microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
        microphoneRef.current.connect(analyserRef.current);
        
        // Create audio buffer for analysis
        audioBufferRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
        
        // Initialize MediaRecorder for audio capture
        recordingRef.current = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus' // Safari compatible
        });
        
        recordingRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        recordingRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = [];
          
          // Convert to Audio for callback
          const reader = new FileReader();
          reader.onload = () => {
            const arrayBuffer = reader.result;
            if (options.onSpeechEnd) {
              options.onSpeechEnd(new Uint8Array(arrayBuffer));
            }
          };
          reader.readAsArrayBuffer(audioBlob);
        };
        
        setIsLoaded(true);
        setIsLoading(false);
        console.log('✅ Safari VAD initialized successfully!');
        
      } catch (err) {
        if (!mounted) return;
        console.error('❌ Error initializing Safari VAD:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    initSafariVAD();
    
    return () => {
      mounted = false;
      cleanup();
    };
  }, []);
  
  // Cleanup function
  const cleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (recordingRef.current && recordingRef.current.state !== 'inactive') {
      recordingRef.current.stop();
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };
  
  // Voice activity detection analysis
  const analyzeAudio = () => {
    if (!analyserRef.current || !audioBufferRef.current) return;
    
    analyserRef.current.getByteFrequencyData(audioBufferRef.current);
    
    // Calculate volume (RMS)
    let sum = 0;
    for (let i = 0; i < audioBufferRef.current.length; i++) {
      sum += audioBufferRef.current[i] * audioBufferRef.current[i];
    }
    const volume = Math.sqrt(sum / audioBufferRef.current.length) / 255;
    
    // Calculate frequency activity (focus on voice range 80Hz-1000Hz)
    const voiceStart = Math.floor(80 * audioBufferRef.current.length / (config.sampleRate / 2));
    const voiceEnd = Math.floor(1000 * audioBufferRef.current.length / (config.sampleRate / 2));
    
    let voiceSum = 0;
    for (let i = voiceStart; i < voiceEnd && i < audioBufferRef.current.length; i++) {
      voiceSum += audioBufferRef.current[i];
    }
    const voiceActivity = voiceSum / ((voiceEnd - voiceStart) * 255);
    
    // Determine if speech is detected
    const speechDetected = volume > config.volumeThreshold || voiceActivity > config.frequencyThreshold;
    const currentTime = Date.now();
    
    if (speechDetected && !isSpeakingRef.current) {
      // Speech started
      speechStartTimeRef.current = currentTime;
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      
      // Start recording
      if (recordingRef.current && recordingRef.current.state === 'inactive') {
        audioChunksRef.current = [];
        recordingRef.current.start(100); // Collect data every 100ms
      }
      
      // Play start beep
      playBeep(800, 0.1); // Higher pitch
      
      console.log('🎤 Speech started (Safari VAD)');
      if (options.onSpeechStart) options.onSpeechStart();
      
    } else if (!speechDetected && isSpeakingRef.current) {
      // Check if we should end speech (silence duration)
      if (!speechEndTimeRef.current) {
        speechEndTimeRef.current = currentTime;
      } else if (currentTime - speechEndTimeRef.current > config.maxSilenceDuration) {
        // Speech ended
        const speechDuration = currentTime - speechStartTimeRef.current;
        
        if (speechDuration >= config.minSpeechDuration) {
          console.log('🔇 Speech ended (Safari VAD) - Duration:', speechDuration, 'ms');
          
          // Stop recording
          if (recordingRef.current && recordingRef.current.state === 'recording') {
            recordingRef.current.stop();
          }
          
          // Play end beep
          playBeep(400, 0.1); // Lower pitch
          
        } else {
          console.log('❌ Speech too short (Safari VAD) - Duration:', speechDuration, 'ms');
          // Stop recording without callback
          if (recordingRef.current && recordingRef.current.state === 'recording') {
            recordingRef.current.stop();
          }
          audioChunksRef.current = [];
          
          if (options.onVADMisfire) options.onVADMisfire();
        }
        
        isSpeakingRef.current = false;
        setIsSpeaking(false);
        speechEndTimeRef.current = null;
      }
    } else if (speechDetected && isSpeakingRef.current) {
      // Reset silence timer
      speechEndTimeRef.current = null;
    }
    
    // Continue monitoring
    if (isListening) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  };
  
  // Play audio feedback beep
  const playBeep = (frequency, duration) => {
    try {
      if (!audioContextRef.current) return;
      
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
    } catch (e) {
      console.log('Could not play beep:', e);
    }
  };
  
  // Toggle listening state
  const toggle = async (shouldListen) => {
    try {
      if (!audioContextRef.current) {
        console.error('❌ Safari VAD not initialized');
        return false;
      }
      
      // Resume AudioContext if suspended (Safari requirement)
      if (audioContextRef.current.state === 'suspended') {
        console.log('▶️ Resuming AudioContext...');
        await audioContextRef.current.resume();
      }
      
      if (shouldListen && !isListening) {
        console.log('▶️ Starting Safari VAD listening...');
        setIsListening(true);
        
        // Reset state
        isSpeakingRef.current = false;
        speechStartTimeRef.current = null;
        speechEndTimeRef.current = null;
        
        // Start analysis loop
        analyzeAudio();
        
        console.log('✅ Safari VAD listening started');
        return true;
        
      } else if (!shouldListen && isListening) {
        console.log('⏸️ Stopping Safari VAD listening...');
        setIsListening(false);
        
        // Cancel analysis loop
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        // Stop any ongoing recording
        if (recordingRef.current && recordingRef.current.state === 'recording') {
          recordingRef.current.stop();
        }
        
        // Reset speaking state
        if (isSpeakingRef.current) {
          isSpeakingRef.current = false;
          setIsSpeaking(false);
        }
        
        console.log('✅ Safari VAD listening stopped');
        return true;
      }
      
      return true; // Already in desired state
    } catch (err) {
      console.error('❌ Error toggling Safari VAD:', err);
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
    toggle,
    isSafariVAD: true // Flag to identify this as Safari VAD
  };
};

export default useSafariVAD;