import 'dotenv/config';
import { createServer } from 'http';
import app from './app.js';
import { initializeSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`KrishiSarthi Backend running on port ${PORT}`);
  console.log(`Socket.IO server ready`);
});