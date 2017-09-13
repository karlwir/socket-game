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
const crystals = new Map();
const scores = new Map();
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
  const crystal = { x: randomNumber(mapWidth - 32) + 16, y: randomNumber(mapHeight - 32) + 16, id: uuidv4(), grabbed: false };
  crystals.set(crystal.id, crystal);
  io.sockets.emit('newCrystal', crystal);
}

function getScores() {
  const scoresArray = [];
  scores.forEach((value, key) => scoresArray.push({ key, value }));
  scoresArray.sort((a, b) => b.value - a.value);
  return scoresArray;
}

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    if (socketMap.get(socket)) {
      socket.broadcast.emit('playerLeft', socketMap.get(socket));
      scores.delete(socketMap.get(socket).id);
      socketMap.delete(socket);
    }
  });

  socket.on('newPlayer', (data) => {
    socketMap.forEach((client) => {
      socket.emit('playerJoined', client);
    });
    crystals.forEach((crystal) => {
      if (!crystal.grabbed) {
        socket.emit('newCrystal', crystal);
      }
    });
    socketMap.set(socket, data);
    scores.set(data.id, 0);
    io.sockets.emit('newScores', getScores());
    socket.broadcast.emit('playerJoined', data);
  });

  socket.on('playerMoved', (data) => {
    socketMap.set(socket, data);
    socket.broadcast.emit('opponentMoved', data);
  });

  socket.on('playerBeamed', (data) => {
    socketMap.set(socket, data);
    socket.broadcast.emit('opponentBeamed', data);
  });

  socket.on('playerStoped', (data) => {
    socketMap.set(socket, data);
    socket.broadcast.emit('opponentStoped', data);
  });

  socket.on('crystalGrabbed', (data) => {
    if (!crystals.get(data.crystalId).grabbed) {
      crystals.get(data.crystalId).grabbed = true;
      socket.broadcast.emit('opponentGrabbedCrystal', data);
      const score = scores.get(data.playerId);
      scores.set(data.playerId, score + 1);

      io.sockets.emit('newScores', getScores());
      createCrystal();
    }
  });
});

createCrystal();
server.listen(process.env.PORT || 8080);
