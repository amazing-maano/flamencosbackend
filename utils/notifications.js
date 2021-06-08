const socket_io = require('socket.io');

const io = socket_io();

io.on('connection', (socket) => {
  socket.on('login', () => {
    io.emit('connected');
    console.log('socket on');
  });
});

module.exports = io;
