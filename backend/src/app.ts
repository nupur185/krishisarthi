import express from 'express';
import cors from 'cors';

import farmerRoutes from './routes/farmer.routes.js';
import authRoutes from './routes/auth.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import centerRoutes from './routes/center.routes.js';
import slotRoutes from './routes/slot-routes.js';
import queueRoutes from './routes/queue-routes.js';
import procurementRoutes from './routes/procurement-routes';
import paymentRoutes from './routes/payment-routes.js';

const app = express();

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'KrishiSarthi backend is running',
  });
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────

app.use('/api/farmers', farmerRoutes);

app.use('/api/auth', authRoutes);

app.use('/api/bookings', bookingRoutes);

app.use('/api/centers', centerRoutes);

app.use('/api/slots', slotRoutes);

app.use('/api/payment', paymentRoutes);

// Queue Management
// Includes farmer queue status and admin/operator controls.
app.use('/api/queue', queueRoutes);

app.use('/api/procurement', procurementRoutes);

export default app;