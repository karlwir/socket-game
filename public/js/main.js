/* globals io Phaser */

const socket = io.connect('http://localhost:8080');
// const socket = io.connect('http://172.26.32.232:8080');
const game = new Phaser.Game(512, 336, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

let player;
let crystal;
let cursors;
let spaceKey;
let botActive = false;
let score = 0;
const opponents = [];
const mapWidth = 512;
const mapHeight = 336;
const mapPadding = 15;
const defaultSpeed = 200;
const defaultAcc = 3000;
const defaultDrag = 800;
const scoreSpan = document.getElementById('score');

function preload() {
  game.load.image('dungeon-background', 'assets/img/bg/dungeon.png');
  game.load.image('grass-background', 'assets/img/bg/grass.jpg');
  game.load.image('player', 'assets/img/char/link.png');
  game.load.image('rupee', 'assets/img/misc/red-rupee.png');
  game.load.spritesheet('gem-green-spin', 'assets/img/misc/green-gem-sprite.png', 32, 32, 9);
  game.load.spritesheet('link-idle-front', 'assets/img/char/link-idle-front.png', 48, 48, 8);
  game.load.spritesheet('link-walk-front', 'assets/img/char/link-walk-front.png', 48, 48, 8);
  game.load.spritesheet('link-walk-back', 'assets/img/char/link-walk-back.png', 48, 48, 8);
  game.load.spritesheet('link-walk-left', 'assets/img/char/link-walk-left.png', 48, 48, 8);
  game.load.spritesheet('link-walk-right', 'assets/img/char/link-walk-right.png', 48, 48, 8);
  game.stage.backgroundColor = '#007236';
}

function create() {
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.world.setBounds(0, 0, mapWidth, mapHeight);
  game.background = this.game.add.sprite(0, 0, 'grass-background');
  game.stage.disableVisibilityChange = true;
  const startX = game.world.randomX;
  const startY = game.world.randomY;
  player = createPlayer(startX, startY, undefined);
  cursors = game.input.keyboard.createCursorKeys();
  spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  player.body.maxVelocity.x = defaultSpeed;
  player.body.maxVelocity.y = defaultSpeed;
  player.body.drag.x = defaultDrag;
  player.body.drag.y = defaultDrag;
}

function update() {
  game.physics.arcade.collide(player, crystal, grabGem, null, this);
  player.body.acceleration.x = 0;
  player.body.acceleration.y = 0;
  if (cursors.left.isDown) {
    player.body.acceleration.x -= defaultAcc;
    if (player.key !== 'link-walk-left') {
      player.loadTexture('link-walk-left', 0);
    }
  } else if (cursors.right.isDown) {
    player.body.acceleration.x += defaultAcc;
    if (player.key !== 'link-walk-right') {
      player.loadTexture('link-walk-right', 0);
    }
  }
  if (cursors.up.isDown) {
    player.body.acceleration.y -= defaultAcc;
    if (player.key !== 'link-walk-back') {
      if (!cursors.left.isDown && !cursors.right.isDown) {
        player.loadTexture('link-walk-back', 0);
      }
    }
  } else if (cursors.down.isDown) {
    player.body.acceleration.y += defaultAcc;
    if (player.key !== 'link-walk-front') {
      if (!cursors.left.isDown && !cursors.right.isDown) {
        player.loadTexture('link-walk-front', 0);
      }
    }
  }
  if (player.body.speed > 0) {
    player.animations.play('walk', 20, true);
    if (player.y < -mapPadding) {
      player.y = mapHeight + mapPadding;
    }
    if (player.y > mapHeight + mapPadding) {
      player.y = -mapPadding;
    }
    if (player.x < -mapPadding) {
      player.x = mapWidth + mapPadding;
    }
    if (player.x > mapWidth + mapPadding) {
      player.x = -mapPadding;
    }
    socket.emit('playerMoved', { x: player.x, y: player.y, id: player.playerId });
  } else if (player.body.speed === 0) {
    player.animations.play('idle', 2, true);
    if (player.key !== 'link-idle-front') {
      socket.emit('playerStoped', { x: player.x, y: player.y, id: player.playerId });
      player.loadTexture('link-idle-front', 0);
    }
  }

  if (spaceKey.isDown) {
    if (botActive) {
      botActive = false;
    } else {
      botActive = true;
    }
  }
  if (botActive) {
    botMove();
  }
}

function grabGem(collidePlayer, collideCrystal) {
  score += 1;
  // scoreSpan.innerText = score;
  console.log(score);
  socket.emit('crystalGrabbed', { playerId: collidePlayer.playerId, crystalId: collideCrystal.crystalId });
  collideCrystal.destroy();
}

function render() {

}

socket.on('playerJoined', (data) => {
  const newOpponent = createPlayer(data.x, data.y, data.id);
  opponents[data.id] = newOpponent;
});

socket.on('opponentMoved', (data) => {
  if (opponents[data.id]) {
    const opponent = opponents[data.id];
    opponent.animations.play('walk', 20, true);
    if (opponents[data.id].y > data.y && opponent.key !== 'link-walk-back') {
      if (opponents[data.id].x === data.x) {
        opponent.loadTexture('link-walk-back', 0);
      }
    }
    if (opponents[data.id].y < data.y && opponent.key !== 'link-walk-front') {
      if (opponents[data.id].x === data.x) {
        opponent.loadTexture('link-walk-front', 0);
      }
    }
    if (opponents[data.id].x > data.x && opponent.key !== 'link-walk-left') {
      opponent.loadTexture('link-walk-left', 0);
    }
    if (opponents[data.id].x < data.x && opponent.key !== 'link-walk-right') {
      opponent.loadTexture('link-walk-right', 0);
    }
    opponents[data.id].x = data.x;
    opponents[data.id].y = data.y;
  }
});
socket.on('opponentStoped', (data) => {
  if (opponents[data.id]) {
    const opponent = opponents[data.id];
    if (opponent.key !== 'link-idle-front') {
      opponent.loadTexture('link-idle-front', 0);
    }
    opponent.animations.play('idle', 2, true);
  }
});

socket.on('playerLeft', (data) => {
  const opponent = opponents[data.id];
  opponents.splice(data.id, 1);
  opponent.destroy();
});

socket.on('newCrystal', (data) => {
  crystal = game.add.sprite(data.x, data.y, 'gem-green-spin');
  crystal.crystalId = data.id;
  crystal.animations.add('spin');
  crystal.animations.play('spin', 20, true);
  game.physics.enable(crystal, Phaser.Physics.ARCADE);
});

socket.on('opponentGrabbedCrystal', (data) => {
  if (crystal) {
    crystal.destroy();
  }
});

function createPlayer(x, y, id) {
  const newPlayer = game.add.sprite(x, y, 'link-idle-front');
  if (id) {
    newPlayer.playerId = id;
  } else {
    newPlayer.playerId = uuidv4();
    socket.emit('newPlayer', { x, y, id: newPlayer.playerId });
  }
  newPlayer.scale.setTo(0.7);
  newPlayer.anchor.set(0.5);
  newPlayer.smoothed = false;
  newPlayer.animations.add('walk');
  newPlayer.animations.add('idle');
  game.physics.enable(newPlayer, Phaser.Physics.ARCADE);
  // newPlayer.onAnimationStart.add(() => {
  //   console.log(newPlayer);
  // }, this);
  return newPlayer;
}

function botMove() {
  if (player.x > crystal.x) {
    player.x -= defaultSpeed;
  } else if (player.x < crystal.x) {
    player.x += defaultSpeed;
  }
  if (player.y > crystal.y) {
    player.y -= defaultSpeed;
  } else if (player.y < crystal.y) {
    player.y += defaultSpeed;
  }
  socket.emit('playerMoved', { x: player.x, y: player.y, id: player.playerId });
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
