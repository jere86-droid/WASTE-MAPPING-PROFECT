import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const socketHandler = (io) => {
  // Middleware to authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);

    // Join user-specific room for notifications
    socket.join(`user:${socket.user._id}`);

    // Join admin room if user is admin
    if (socket.user.role === 'admin') {
      socket.join('admins');
    }

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
};

export default socketHandler;