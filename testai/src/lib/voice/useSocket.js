import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

let socket;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState(null);
  
  useEffect(() => {
    const socketInitializer = async () => {
      // Connect directly to the socket server
      socket = io();
      
      socket.on('connect', () => {
        console.log('Connected to socket');
        setIsConnected(true);
        setSocketInstance(socket);
      });
      
      socket.on('disconnect', () => {
        console.log('Disconnected from socket');
        setIsConnected(false);
      });
    };
    
    socketInitializer();
    
    return () => {
      if (socket) socket.disconnect();
    };
  }, []);
  
  const sendAudio = useCallback((audioData) => {
    if (socket && isConnected) {
      socket.emit('audio-data', audioData);
    }
  }, [isConnected]);
  
  return { isConnected, socket: socketInstance, sendAudio };
};