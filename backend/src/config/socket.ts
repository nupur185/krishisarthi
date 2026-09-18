import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

import prisma from './prisma.js';

const JWT_SECRET: string = process.env.JWT_SECRET ?? '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined');
}

interface SocketUser {
  userId: number;
  farmerId: string;
  role: string;
}

interface QueueUpdatePayload {
  centerId: number;
}

let io: Server | null = null;

export function initializeSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    },
  });

  // Authenticate every Socket.IO connection using the same JWT
  // used by the REST API.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token || typeof token !== 'string') {
        return next(
          new Error('Authentication token is required')
        );
      }

      const decoded = jwt.verify(token, JWT_SECRET);

      if (
        typeof decoded === 'string' ||
        typeof decoded.userId !== 'number' ||
        typeof decoded.farmerId !== 'string' ||
        typeof decoded.role !== 'string'
      ) {
        return next(
          new Error('Invalid authentication token')
        );
      }

      socket.data.user = {
        userId: decoded.userId,
        farmerId: decoded.farmerId,
        role: decoded.role,
      } satisfies SocketUser;

      next();
    } catch (error) {
      console.error(
        'Socket authentication error:',
        error
      );

      next(
        new Error('Invalid or expired authentication token')
      );
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as SocketUser;

    console.log(
      `Socket connected: ${socket.id} | userId: ${user.userId} | role: ${user.role}`
    );

    /**
     * Join a procurement center's live queue room.
     *
     * FARMER:
     * The farmer must have a confirmed booking at that center.
     *
     * ADMIN / OPERATOR:
     * Can join the requested center directly.
     */
    socket.on(
      'queue:join-center',
      async (payload: number) => {
        try {
          const centerId = Number(payload);

          if (!centerId || Number.isNaN(centerId)) {
            socket.emit(
              'queue:error',
              'Valid center ID is required'
            );
            return;
          }

          if (
            user.role !== 'ADMIN' &&
            user.role !== 'OPERATOR'
          ) {
            const booking =
              await prisma.booking.findFirst({
                where: {
                  userId: user.userId,
                  status: 'CONFIRMED',
                  slot: {
                    centerId,
                  },
                },
                select: {
                  id: true,
                },
              });

            if (!booking) {
              socket.emit(
                'queue:error',
                'You are not authorized to join this center queue'
              );
              return;
            }
          }

          const room = `center:${centerId}`;

          socket.join(room);

          console.log(
            `Socket ${socket.id} joined queue room ${room}`
          );

          socket.emit('queue:joined', {
            centerId,
          });
        } catch (error) {
          console.error(
            'Queue room join error:',
            error
          );

          socket.emit(
            'queue:error',
            'Unable to join center queue'
          );
        }
      }
    );

    /**
     * Leave a procurement center's live queue room.
     */
    socket.on(
      'queue:leave-center',
      (payload: number) => {
        const centerId = Number(payload);

        if (!centerId || Number.isNaN(centerId)) {
          return;
        }

        const room = `center:${centerId}`;

        socket.leave(room);

        console.log(
          `Socket ${socket.id} left queue room ${room}`
        );
      }
    );

    socket.on('disconnect', () => {
      console.log(
        `Socket disconnected: ${socket.id} | userId: ${user.userId}`
      );
    });
  });

  return io;
}

/**
 * Emit a queue update to every farmer/operator
 * currently watching a procurement center.
 *
 * The actual queue data remains in the REST API.
 * Socket.IO only tells connected clients that
 * they should fetch the latest queue state.
 */
export function emitQueueUpdate(centerId: number) {
  if (!io) {
    throw new Error(
      'Socket.IO has not been initialized'
    );
  }

  const payload: QueueUpdatePayload = {
    centerId,
  };

  io.to(`center:${centerId}`).emit(
    'queue:update',
    payload
  );

  console.log(
    `Queue update emitted for center ${centerId}`
  );
}

export function getIO(): Server {
  if (!io) {
    throw new Error(
      'Socket.IO has not been initialized'
    );
  }

  return io;
}