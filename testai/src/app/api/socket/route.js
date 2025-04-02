import { Server as SocketIOServer } from 'socket.io';

export async function GET(req) {
  // This is a workaround as Next.js App Router doesn't natively 
  // support WebSockets like the Pages Router did
  const res = new Response();
  
  // Check if socket server is already running
  if (global.socketIOServer) {
    return new Response('Socket is already running', { status: 200 });
  }
  
  try {
    // We need access to the raw Node.js response and request
    const socket = await req.socket;
    const upgradeSocket = await socket.upgrade;
    
    // Create a new Socket.IO server
    const io = new SocketIOServer(upgradeSocket.server);
    
    io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      
      // Handle audio data from client
      socket.on('audio-data', async (audioData) => {
        console.log('Received audio data');
        // Will integrate with Whisper later
        
        // Mock response for now
        socket.emit('transcription', 'Audio received, processing...');
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
    
    // Store the server instance globally to reuse
    global.socketIOServer = io;
    
    return new Response('Socket setup complete', { status: 200 });
  } catch (error) {
    console.error('Socket setup error:', error);
    return new Response('Socket setup failed', { status: 500 });
  }
}