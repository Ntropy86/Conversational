import * as ort from 'onnxruntime-web';

class SileroVAD {
  constructor() {
    this.model = null;
    this.modelLoaded = false;
    this.sampleRate = 16000;
    this.threshold = 0.5;
    this.initialized = false;
    this.h = null; // Hidden state
    this.c = null; // Cell state
    this.samplesPerWindow = 512;
  }

  async initialize() {
    try {
      // Path to your Silero VAD ONNX model
      const modelPath = '/models/silero_vad.onnx';
      
      // Set WebAssembly execution providers
      const options = {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all'
      };
      
      console.log('Loading Silero VAD model...');
      this.model = await ort.InferenceSession.create(modelPath, options);
      
      // Initialize hidden states
      const batchSize = 1;
      const hiddenSize = 64;
      
      this.h = new Float32Array(batchSize * hiddenSize).fill(0);
      this.c = new Float32Array(batchSize * hiddenSize).fill(0);
      
      this.modelLoaded = true;
      this.initialized = true;
      console.log('Silero VAD model loaded successfully');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Silero VAD:', error);
      return false;
    }
  }

  // Reset state when starting a new recording
  resetState() {
    if (this.initialized) {
      const batchSize = 1;
      const hiddenSize = 64;
      this.h = new Float32Array(batchSize * hiddenSize).fill(0);
      this.c = new Float32Array(batchSize * hiddenSize).fill(0);
    }
  }

  // Process audio chunk and return speech probability
  async processAudio(audioChunk) {
    if (!this.modelLoaded) {
      console.error('Model not loaded');
      return 0;
    }
    
    try {
      // Ensure chunk is the correct size
      if (audioChunk.length !== this.samplesPerWindow) {
        console.error(`Expected chunk of ${this.samplesPerWindow} samples, got ${audioChunk.length}`);
        return 0;
      }
      
      // Create input tensors
      const inputTensor = new ort.Tensor('float32', new Float32Array(audioChunk), [1, audioChunk.length]);
      const srTensor = new ort.Tensor('int64', [BigInt(this.sampleRate)], [1]);
      const hTensor = new ort.Tensor('float32', this.h, [1, 1, 64]);
      const cTensor = new ort.Tensor('float32', this.c, [1, 1, 64]);
      
      // Run model
      const feeds = {
        input: inputTensor,
        sr: srTensor,
        h: hTensor,
        c: cTensor
      };
      
      const outputMap = await this.model.run(feeds);
      
      // Get outputs
      const prediction = outputMap.output.data[0];
      
      // Update hidden state for next call
      this.h = outputMap.hn.data;
      this.c = outputMap.cn.data;
      
      return prediction;
    } catch (error) {
      console.error('Error running VAD inference:', error);
      return 0;
    }
  }

  // Check if audio chunk contains speech
  async isSpeech(audioChunk) {
    const probability = await this.processAudio(audioChunk);
    return probability > this.threshold;
  }
  
  // Utility to resample audio to 16kHz if needed
  resampleAudio(audioBuffer, originalSampleRate) {
    // Simple linear resampling for demo
    // In production, use a proper resampling library
    if (originalSampleRate === this.sampleRate) {
      return new Float32Array(audioBuffer);
    }
    
    const ratio = this.sampleRate / originalSampleRate;
    const newLength = Math.round(audioBuffer.length * ratio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      const oldIndex = Math.min(Math.floor(i / ratio), audioBuffer.length - 1);
      result[i] = audioBuffer[oldIndex];
    }
    
    return result;
  }
}

export default SileroVAD;