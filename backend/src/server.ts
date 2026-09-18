import 'dotenv/config';
import { createServer } from 'http';
import app from './app.js';
import { initializeSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`KrishiSarthi Backend running on http://localhost:${PORT}`);
  console.log(`Socket.IO server ready`);
});