var socket = io.connect('http://localhost:8080');
var game = new Phaser.Game(512, 336, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

var player;
var cursors;
var opponents= [];
var mapWidth = 512;
var mapheight = 336;
var mapPadding = 30;
var defaultSpeed = 3;

function preload() {
    game.load.image('dungeon-background', 'assets/img/bg/dungeon.png');
    game.load.image('player', 'assets/img/char/link.png');
    game.stage.backgroundColor = '#007236';
}

function create() {
    game.world.setBounds(0, 0, mapWidth, mapheight);
    game.background = this.game.add.sprite(0, 0, 'dungeon-background');
    player = createPlayer(game.world.randomX, game.world.randomY);
    cursors = game.input.keyboard.createCursorKeys();
}

function update() {
    var playerMoved = false
    if (cursors.up.isDown) {
      player.y -= defaultSpeed;
      if (player.y < -mapPadding) {
        player.y = mapheight + mapPadding;
      }
      playerMoved = true;
    }
    else if (cursors.down.isDown) {
      player.y += defaultSpeed;
      if (player.y > mapheight + mapPadding) {
        player.y = -mapPadding;
      }
      playerMoved = true;
    }
    if (cursors.left.isDown) {
      player.x -= defaultSpeed;
      if (player.x < -mapPadding) {
        player.x = mapWidth + mapPadding;
      }
      playerMoved = true;
    }
    else if (cursors.right.isDown) {
      player.x += defaultSpeed;
      if (player.x > mapWidth + mapPadding) {
        player.x = -mapPadding;
      }
      playerMoved = true;
    }
    if (playerMoved) {
      socket.emit('playerMoved', {'x': player.x, 'y': player.y, 'id': player.playerId});
    }
}

function render() {

}

socket.on('playerJoined', (data) => {
  var newOpponent = createPlayer(data.x, data.y, data.id);
  opponents.push(newOpponent);
});

socket.on('opponentMoved', (data) => {
  opponents.forEach((opponent) => {
    if (opponent.playerId === data.id) {
      opponent.x = data.x;
      opponent.y = data.y;
    }
  });
});

socket.on('playerLeft', (data) => {
  opponents.forEach((opponent) => {
    if (opponent.playerId === data.id) {
      var i = opponents.indexOf(opponent);
      opponents.splice(i, 1);
      opponent.destroy();
    }
  });
});

function createPlayer(x, y, id) {
  var newPlayer = game.add.sprite(x, y, 'player');
  if (id) {
    console.log("Create join");
    newPlayer.playerId = id;
  }
  else {
    console.log("Create player");
    newPlayer.playerId = uuidv4();
    socket.emit('newPlayer', {'x': x, 'y': y, 'id': newPlayer.playerId});
  }
  return newPlayer;
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
