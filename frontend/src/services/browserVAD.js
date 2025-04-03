/**
 * BrowserVAD - A simple but effective Voice Activity Detector
 * using the Web Audio API - no external models needed
 */
class BrowserVAD {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.source = null;
    this.isListening = false;
    this.silenceStart = null;
    this.speechDetected = false;
    this.onSpeechStart = null;
    this.onSpeechEnd = null;
    this.silenceThreshold = 1000; // ms
    this.energyThreshold = 0.015; // Adjust based on testing
    this.consecutiveFrames = 0;
    this.framesToConfirm = 3;
    this.stream = null;
    this.processor = null;
  }

  async initialize() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      return true;
    } catch (error) {
      console.error('Error initializing BrowserVAD:', error);
      return false;
    }
  }

  /**
   * Start listening for speech
   */
  async start() {
    if (this.isListening) return true;
    
    try {
      // Reset state
      this.silenceStart = null;
      this.speechDetected = false;
      this.consecutiveFrames = 0;
      
      // Create audio context if needed
      if (!this.audioContext) {
        await this.initialize();
      }
      
      // Get microphone stream
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Create source and analyzer
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyser
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.5;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      
      // Connect source to analyser
      this.source.connect(this.analyser);
      
      // Create script processor for continuous analysis
      this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);
      this.processor.onaudioprocess = this._processAudio.bind(this);
      
      // Connect processor
      this.analyser.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Error starting BrowserVAD:', error);
      return false;
    }
  }

  /**
   * Stop listening
   */
  stop() {
    if (!this.isListening) return;
    
    // Disconnect and clean up
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    
    // Stop all tracks in the stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.isListening = false;
  }

  /**
   * Register callbacks for speech events
   */
  setCallbacks(callbacks = {}) {
    this.onSpeechStart = callbacks.onSpeechStart || null;
    this.onSpeechEnd = callbacks.onSpeechEnd || null;
  }

  /**
   * Adjust sensitivity
   */
  setSensitivity(sensitivity) {
    // Sensitivity range from 0 (least sensitive) to 1 (most sensitive)
    const minThreshold = 0.005;
    const maxThreshold = 0.05;
    const normalizedSensitivity = Math.min(Math.max(sensitivity, 0), 1);
    this.energyThreshold = maxThreshold - (normalizedSensitivity * (maxThreshold - minThreshold));
  }

  /**
   * Set silence duration before ending speech
   */
  setSilenceThreshold(millis) {
    this.silenceThreshold = millis;
  }

  /**
   * Process audio to detect speech
   * @private
   */
  _processAudio() {
    // Get frequency data
    this.analyser.getByteFrequencyData(this.dataArray);
    
    // Calculate energy level
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const average = sum / this.dataArray.length;
    const normalizedEnergy = average / 255;
    
    // Detect speech based on energy level
    const isSpeaking = normalizedEnergy > this.energyThreshold;
    
    if (isSpeaking) {
      this.consecutiveFrames++;
      
      // Confirm speech after several consecutive frames
      if (this.consecutiveFrames >= this.framesToConfirm && !this.speechDetected) {
        this.speechDetected = true;
        this.silenceStart = null;
        
        if (this.onSpeechStart) {
          this.onSpeechStart();
        }
      } else if (this.speechDetected) {
        // Reset silence timer if we're still speaking
        this.silenceStart = null;
      }
    } else {
      this.consecutiveFrames = 0;
      
      // If we were previously speaking, start silence timer
      if (this.speechDetected) {
        if (!this.silenceStart) {
          this.silenceStart = Date.now();
        } else if (Date.now() - this.silenceStart > this.silenceThreshold) {
          // Silence long enough to end speech
          this.speechDetected = false;
          
          if (this.onSpeechEnd) {
            this.onSpeechEnd();
          }
        }
      }
    }
  }
}

export default BrowserVAD;