// const socket = io.connect('https://intense-lowlands-35644.herokuapp.com/');
const socket = io.connect('http://localhost:8080');
// const socket = io.connect('http://172.26.32.232:8080');
const game = new Phaser.Game(512, 336, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

let player;
let crystal;
let cursors;
let spaceKey;
let botActive = false;
let score = 0;

const defaultSpeed = 200;
const defaultAcc = 3000;
const defaultDrag = 800;

const opponents = [];
const mapWidth = 512;
const mapHeight = 336;
const mapPadding = 15;
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
}

function create() {
  cursors = game.input.keyboard.createCursorKeys();
  spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.world.setBounds(0, 0, mapWidth, mapHeight);
  game.background = this.game.add.sprite(0, 0, 'grass-background');
  game.stage.disableVisibilityChange = true;
  const startX = crystalChase.utils.randomNumber(mapWidth);
  const startY = crystalChase.utils.randomNumber(mapHeight);
  const startId = crystalChase.utils.uuidv4();
  player = createPlayer(startX, startY, startId);
  player.animationIdle();
  socket.emit('newPlayer', { x: startX, y: startY, id: startId });
}

function update() {
  game.physics.arcade.collide(player.sprite, crystal, grabGem, null, this);
  player.stopMoving();
  if (cursors.left.isDown) {
    player.moveLeft();
  } else if (cursors.right.isDown) {
    player.moveRight();
  }
  if (cursors.up.isDown) {
    player.moveUp();
  } else if (cursors.down.isDown) {
    player.moveDown();
  }
  if (player.getSpeed() > 0) {
    player.animationWalk();
    if (player.handleOutOfBounds()) {
      socket.emit('playerBeamed', { x: player.getX(), y: player.getY(), id: player.id });
    } else {
      socket.emit('playerMoved', { x: player.getX(), y: player.getY(), id: player.id });
    }
  } else if (player.getSpeed() === 0) {
    if (player.sprite.key !== 'link-idle-front') {
      player.animationIdle();
      socket.emit('playerStoped', { x: player.getX(), y: player.getY(), id: player.id });
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
    for (let i = 0; i < 3; i += 1) {
      botMove();
    }
  }
}

function grabGem(collidePlayer, collideCrystal) {
  score += 1;
  socket.emit('crystalGrabbed', { playerId: collidePlayer.playerId, crystalId: collideCrystal.crystalId });
  collideCrystal.destroy();
}

function render() {

}

socket.on('playerJoined', (data) => {
  console.log(data);
  const newOpponent = createPlayer(data.x, data.y, data.id);
  opponents[data.id] = newOpponent;
  newOpponent.animationIdle();
});

socket.on('opponentMoved', (data) => {
  if (opponents[data.id]) {
    const opponent = opponents[data.id];
    let ang = game.physics.arcade.angleToXY(opponent.sprite, data.x, data.y) * (180 / Math.PI);

    if (ang < 0) {
      ang = Math.abs(ang) + 180;
    }

    if (ang >= 225 && ang <= 315) {
      opponent.animationWalkUp();
    } else if (ang >= 45 && ang <= 135) {
      opponent.animationWalkDown();
    } else if (ang > 135 && ang < 225) {
      opponent.animationWalkLeft();
    } else if (ang < 45 || ang > 315) {
      opponent.animationWalkRight();
    }
    game.physics.arcade.moveToXY(opponent.sprite, data.x, data.y, 60, game.time.elapsedMS);
    setTimeout(() => {
      opponent.setX(data.x);
      opponent.setY(data.y);
    }, game.time.elapsedMS);
  }
});

socket.on('opponentBeamed', (data) => {
  if (opponents[data.id]) {
    const opponent = opponents[data.id];
    opponent.setX(data.x);
    opponent.setY(data.y);
  }
});

socket.on('opponentStoped', (data) => {
  if (opponents[data.id]) {
    const opponent = opponents[data.id];
    opponent.animationIdle();
  }
});

socket.on('playerLeft', (data) => {
  if (opponents[data.id]) {
    const opponent = opponents[data.id];
    opponents.splice(data.id, 1);
    opponent.sprite.destroy();
  }
});

socket.on('newCrystal', (data) => {
  crystal = game.add.sprite(data.x, data.y, 'gem-green-spin');
  crystal.crystalId = data.id;
  crystal.animations.add('spin');
  crystal.animations.play('spin', 20, true);
  game.physics.enable(crystal, Phaser.Physics.ARCADE);
});

socket.on('opponentGrabbedCrystal', () => {
  if (crystal) {
    crystal.destroy();
  }
});

function createPlayer(x, y, id) {
  const newPlayerSprite = game.add.sprite(x, y, 'link-idle-front');
  const newPlayer = new crystalChase.models.Player(game, newPlayerSprite, id);
  return newPlayer;
}
