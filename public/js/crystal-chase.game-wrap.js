// const socket = io.connect('https://intense-lowlands-35644.herokuapp.com/');
const socket = io.connect('http://localhost:8080');
// const socket = io.connect('http://172.26.32.232:8080');
crystalChase.gameWrap = {
  game: {},
  player: {},
  crystal: {},
  cursors: {},

  soundDing: undefined,
  soundChip: undefined,
  soundTakenTheLead: undefined,
  soundLostTheLead: undefined,
  soundBackgroundTune: undefined,

  defaultSpeed: 200,
  defaultAcc: 3000,
  defaultDrag: 800,

  opponents: [],
  mapWidth: 512,
  mapHeight: 336,
  mapPadding: 15,

  initGame: function initGame() {
    this.game = new Phaser.Game(512, 336, Phaser.AUTO, 'crystal-chase', { preload: this.preload, create: this.create, update: this.update, render: this.render });
  },

  grabGem: function grabGem() {
    crystalChase.gameWrap.soundDing.play();
    crystalChase.gameWrap.soundChip.play();
    socket.emit('crystalGrabbed', { playerId: crystalChase.gameWrap.player.id, crystalId: crystalChase.gameWrap.crystal.id });
    crystalChase.gameWrap.crystal.sprite.destroy();
  },

  createPlayer: function createPlayer(x, y, id) {
    const newPlayerSprite = this.game.add.sprite(x, y, 'link-idle-front');
    const newPlayer = new crystalChase.models.Player(this.game, newPlayerSprite, id);
    return newPlayer;
  },

  preload: function preload() {
    this.game.load.image('dungeon-background', 'assets/img/bg/dungeon2.png');
    this.game.load.image('grass-background', 'assets/img/bg/grass.jpg');
    this.game.load.image('player', 'assets/img/char/link.png');
    this.game.load.image('rupee', 'assets/img/misc/red-rupee.png');
    this.game.load.spritesheet('gem-green-spin', 'assets/img/misc/red-gem-sprite.png', 32, 32, 9);
    this.game.load.spritesheet('link-idle-front', 'assets/img/char/link-idle-front.png', 48, 48, 8);
    this.game.load.spritesheet('link-walk-front', 'assets/img/char/link-walk-front.png', 48, 48, 8);
    this.game.load.spritesheet('link-walk-back', 'assets/img/char/link-walk-back.png', 48, 48, 8);
    this.game.load.spritesheet('link-walk-left', 'assets/img/char/link-walk-left.png', 48, 48, 8);
    this.game.load.spritesheet('link-walk-right', 'assets/img/char/link-walk-right.png', 48, 48, 8);

    this.game.load.audio('sound-ding', 'assets/audio/ding.mp3');
    this.game.load.audio('sound-chip', 'assets/audio/chip.wav');
    this.game.load.audio('sound-taken-the-lead', 'assets/audio/taken-the-lead.mp3');
    this.game.load.audio('sound-lost-the-lead', 'assets/audio/lost-the-lead.mp3');
    this.game.load.audio('sound-background-tune', 'assets/audio/background-tune.mp3');
  },

  create: function create() {
    crystalChase.gameWrap.cursors = this.game.input.keyboard.createCursorKeys();
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.world.setBounds(0, 0, this.mapWidth, this.mapHeight);
    this.game.background = this.game.add.sprite(0, 0, 'dungeon-background');
    this.game.stage.disableVisibilityChange = true;
    const startX = crystalChase.utils.randomNumber(crystalChase.gameWrap.mapWidth);
    const startY = crystalChase.utils.randomNumber(crystalChase.gameWrap.mapHeight);
    const startId = crystalChase.utils.uuidv4();
    crystalChase.gameWrap.player = crystalChase.gameWrap.createPlayer(startX, startY, startId);
    crystalChase.gameWrap.player.animationIdle();
    socket.emit('newPlayer', { x: startX, y: startY, id: startId });

    crystalChase.gameWrap.soundDing = this.game.add.audio('sound-ding');
    crystalChase.gameWrap.soundChip = this.game.add.audio('sound-chip');
    crystalChase.gameWrap.soundTakenTheLead = this.game.add.audio('sound-taken-the-lead');
    crystalChase.gameWrap.soundLostTheLead = this.game.add.audio('sound-lost-the-lead');
    crystalChase.gameWrap.soundBackgroundTune = this.game.add.audio('sound-background-tune');
    crystalChase.gameWrap.soundBackgroundTune.loopFull();
  },

  update: function update() {
    const player = crystalChase.gameWrap.player;
    const crystal = crystalChase.gameWrap.crystal;
    const cursors = crystalChase.gameWrap.cursors;

    if (crystal) {
      this.game.physics.arcade
        .collide(player.sprite, crystal.sprite, crystalChase.gameWrap.grabGem, null, this);
    }
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
  },

  render: function render() {},
};
document.addEventListener('DOMContentLoaded', () => {
  crystalChase.gameWrap.initGame();
});

socket.on('playerJoined', (data) => {
  const newOpponent = crystalChase.gameWrap.createPlayer(data.x, data.y, data.id);
  crystalChase.gameWrap.opponents[data.id] = newOpponent;
  newOpponent.animationIdle();
});

socket.on('opponentMoved', (data) => {
  const opponent = crystalChase.gameWrap.opponents[data.id];
  if (opponent) {
    let ang = crystalChase.gameWrap.game.physics.arcade
      .angleToXY(opponent.sprite, data.x, data.y) * (180 / Math.PI);

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
    crystalChase.gameWrap.game.physics.arcade
      .moveToXY(opponent.sprite, data.x, data.y, 60, crystalChase.gameWrap.game.time.elapsedMS);
    setTimeout(() => {
      opponent.setX(data.x);
      opponent.setY(data.y);
    }, crystalChase.gameWrap.game.time.elapsedMS);
  }
});

socket.on('opponentBeamed', (data) => {
  const opponent = crystalChase.gameWrap.opponents[data.id];
  if (opponent) {
    opponent.setX(data.x);
    opponent.setY(data.y);
  }
});

socket.on('opponentStoped', (data) => {
  const opponent = crystalChase.gameWrap.opponents[data.id];
  if (opponent) {
    opponent.animationIdle();
  }
});

socket.on('playerLeft', (data) => {
  const opponent = crystalChase.gameWrap.opponents[data.id];
  if (opponent) {
    crystalChase.gameWrap.opponents.splice(data.id, 1);
    opponent.sprite.destroy();
  }
});

socket.on('newCrystal', (data) => {
  const newCrystalSprite = crystalChase.gameWrap.game.add.sprite(data.x, data.y, 'gem-green-spin');
  crystalChase.gameWrap.crystal =
    new crystalChase.models.Crystal(crystalChase.gameWrap.game, newCrystalSprite, data.id);
});

socket.on('newScores', (data) => {
  crystalChase.scoreBoard.updateScoreboard(data);
});

socket.on('opponentGrabbedCrystal', () => {
  crystalChase.gameWrap.soundChip.play();
  if (crystalChase.gameWrap.crystal) {
    crystalChase.gameWrap.crystal.sprite.destroy();
  }
});
