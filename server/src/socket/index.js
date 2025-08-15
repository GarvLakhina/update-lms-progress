export function registerSocketHandlers(io, socket) {
  // Client should send userId after connect to join personal room
  socket.on('register', ({ userId }) => {
    if (userId) {
      socket.join(`user:${userId}`);
    }
  });

  socket.on('disconnect', () => {});
}

export function emitToUser(io, userId, event, payload) {
  io.to(`user:${userId}`).emit(event, payload);
}
