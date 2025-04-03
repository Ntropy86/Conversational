// App.jsx
import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentResponse, setCurrentResponse] = useState('');
  
  const websocketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Setup WebSocket connection
  useEffect(() => {
    websocketRef.current = new WebSocket('ws://localhost:8000/ws');
    
    websocketRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
    };
    
    websocketRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);
    };
    
    websocketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'transcription':
          setConversation(prev => [...prev, { role: 'user', content: data.text }]);
          setCurrentResponse('');
          break;
          
        case 'token':
          setCurrentResponse(prev => prev + data.text);
          break;
          
        case 'speech':
          // Play the received audio
          const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
          audio.play();
          
          // If this is a complete sentence, add it to conversation
          setConversation(prev => {
            const newConvo = [...prev];
            const lastItem = newConvo[newConvo.length - 1];
            
            if (lastItem?.role === 'assistant') {
              lastItem.content += ' ' + data.text;
            } else {
              newConvo.push({ role: 'assistant', content: data.text });
            }
            
            return newConvo;
          });
          
          setCurrentResponse('');
          break;
          
        case 'error':
          console.error(data.message);
          break;
      }
    };
    
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);
  
  // Setup audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(audioContextRef.current.destination);
      
      // Process audio chunks
      processor.onaudioprocess = (e) => {
        const channelData = e.inputBuffer.getChannelData(0);
        
        // Convert to Float32Array for processing
        const audioBuffer = new Float32Array(channelData);
        
        // Send audio buffer to server
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
          // Convert to base64
          const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
          const reader = new FileReader();
          
          reader.onloadend = () => {
            websocketRef.current.send(reader.result);
          };
          
          reader.readAsDataURL(audioBlob);
        }
      };
      
      setIsRecording(true);
      
      // Also set up MediaRecorder for better user feedback
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.start();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };
  
  // Debug/test components
  const testComponents = async (component) => {
    // For testing individual components
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      const base64Audio = reader.result;
      
      try {
        const response = await fetch(`http://localhost:8000/test/${component}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: base64Audio }),
        });
        
        const result = await response.json();
        console.log(`${component} test result:`, result);
        alert(JSON.stringify(result));
      } catch (error) {
        console.error(`Error testing ${component}:`, error);
      }
    };
    
    reader.readAsDataURL(audioBlob);
  };
  
  return (
    <div className="app-container">
      <h1>AI Assistant</h1>
      
      <div className="connection-status">
        {isConnected ? (
          <span className="status-connected">Connected</span>
        ) : (
          <span className="status-disconnected">Disconnected</span>
        )}
      </div>
      
      <div className="conversation-container">
        {conversation.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        
        {currentResponse && (
          <div className="message assistant">
            <div className="message-content typing">{currentResponse}</div>
          </div>
        )}
      </div>
      
      <div className="controls">
        <button 
          className={`record-button ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? 'Stop' : 'Start'} Recording
        </button>
      </div>
      
      <div className="debug-panel">
        <h3>Debug Tools</h3>
        <button onClick={() => testComponents('vad')}>Test VAD</button>
        <button onClick={() => testComponents('transcribe')}>Test Transcription</button>
        <button onClick={() => testComponents('llm')}>Test LLM</button>
        <button onClick={() => testComponents('tts')}>Test TTS</button>
      </div>
    </div>
  );
}

export default App;