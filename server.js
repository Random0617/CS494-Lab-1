const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let number = 0;

app.use(express.static('public'));

io.on('connection', (socket) => {
  // Emit the current number to the client
  socket.emit('updateNumber', number);
  
  // Handle button click from any client
  socket.on('incrementNumber', () => {
    number++;
    // Broadcast the updated number to all clients
    io.emit('updateNumber', number);
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
