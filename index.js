const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.Server(app);
const io = socketIo(server);

// Serve files from dir public
app.use(express.static('public'));

const mapWidth = 512;
const mapHeight = 336;
const activeCrystals = new Map();
const socketMap = new Map();

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
function randomNumber(max) {
  return Math.floor(Math.random() * max) + 1;
}

function createCrystal() {
  console.log(activeCrystals.size);
  const crystal = { x: randomNumber(mapWidth - 32) + 16, y: randomNumber(mapHeight - 32) + 16, id: uuidv4(), grabbed: false };
  activeCrystals.set(crystal.id, crystal);
  io.sockets.emit('newCrystal', crystal);
}

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    socket.broadcast.emit('playerLeft', socketMap.get(socket));
    socketMap.delete(socket);
  });

  socket.on('newPlayer', (data) => {
    socketMap.forEach((client) => {
      socket.emit('playerJoined', client);
    });
    activeCrystals.forEach((crystal) => {
      if (!crystal.grabbed) {
        socket.emit('newCrystal', crystal);
      }
    });
    socketMap.set(socket, data);
    socket.broadcast.emit('playerJoined', data);
  });

  socket.on('playerMoved', (data) => {
    socketMap.set(socket, data);
    socket.broadcast.emit('opponentMoved', data);
  });

  socket.on('playerStoped', (data) => {
    socketMap.set(socket, data);
    socket.broadcast.emit('opponentStoped', data);
  });

  socket.on('crystalGrabbed', (data) => {
    if (!activeCrystals.get(data.crystalId).grabbed) {
      activeCrystals.get(data.crystalId).grabbed = true;
      socket.broadcast.emit('opponentGrabbedCrystal', data);
      createCrystal();
    }
  });
});

createCrystal();
server.listen(process.env.PORT || 8080);
