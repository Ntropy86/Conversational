const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });
  
  const io = new Server(server);
  
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
  
  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});