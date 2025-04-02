'use client';

import React, { useState, useEffect } from 'react';
import { useSocket } from '../../lib/voice/useSocket';

const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const { isConnected, socket, sendAudio } = useSocket();
  
  useEffect(() => {
    if (socket) {
      socket.on('transcription', (text) => {
        setTranscript(text);
      });
      
      socket.on('llm-response', (text) => {
        setResponse(text);
      });
    }
    
    return () => {
      if (socket) {
        socket.off('transcription');
        socket.off('llm-response');
      }
    };
  }, [socket]);
  
  const handleStartRecording = () => {
    setIsRecording(true);
    // We'll implement actual recording in Hour 2
    console.log('Recording started...');
  };
  
  const handleStopRecording = () => {
    setIsRecording(false);
    // We'll implement actual recording in Hour 2
    console.log('Recording stopped...');
    
    // For now, just send a mock audio blob
    sendAudio('mock-audio-data');
  };
  
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Voice Assistant</h2>
      
      <div className="mb-4">
        <button
          className={`px-4 py-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-blue-500'} text-white`}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        
        <p className="mt-2 text-gray-500">
          {isConnected ? 'Connected to server' : 'Connecting...'}
        </p>
      </div>
      
      {transcript && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <h3 className="font-semibold">Transcript:</h3>
          <p>{transcript}</p>
        </div>
      )}
      
      {response && (
        <div className="p-3 bg-blue-50 rounded">
          <h3 className="font-semibold">Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;