const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIo(server);

// Serve files from dir public
app.use(express.static('public'));

var allClients = [];

io.on('connection', (socket) => {

  allClients.push(socket);

  socket.on('disconnect', function() {
     var i = allClients.indexOf(socket);
     allClients.splice(i, 1);
     socket.broadcast.emit('playerLeft', socket.player);
  });

  socket.on('newPlayer', (data) => {
    allClients.forEach((client) => {
      if (client.player) {
        socket.emit('playerJoined', client.player);
      }
    });
    socket.player = data;
    socket.broadcast.emit('playerJoined', data);
  });

  socket.on('playerMoved', (data) => {
    socket.player = data;
    socket.broadcast.emit('opponentMoved', data);
  });
});

server.listen(8080);
