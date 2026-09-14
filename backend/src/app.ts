import express from 'express';
import cors from 'cors';

import farmerRoutes from './routes/farmer.routes.js';
import authRoutes from './routes/auth.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import centerRoutes from './routes/center.routes.js';
import slotRoutes from './routes/slot-routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'KrishiSarthi backend is running',
  });
});

app.use('/api/farmers', farmerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/centers', centerRoutes);
app.use('/api/slots', slotRoutes);

export default app;