crystalChase.gameWrap = {
  game: {},
  player: {},
  crystal: {},
  cursors: {},
  socket: {},

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
    crystalChase.network.connect();
    this.game = new Phaser.Game(512, 336, Phaser.AUTO, 'crystal-chase', { preload: this.preload, create: this.create, update: this.update, render: this.render });
  },

  grabGem: function grabGem() {
    crystalChase.gameWrap.soundDing.play();
    crystalChase.gameWrap.soundChip.play();
    crystalChase.network.crystalGrabbed(
      { playerId: crystalChase.gameWrap.player.id, crystalId: crystalChase.gameWrap.crystal.id });
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
    crystalChase.network.newPlayer({ x: startX, y: startY, id: startId });

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
        crystalChase.network.playerBeamed({ x: player.getX(), y: player.getY(), id: player.id });
      } else {
        crystalChase.network.playerMoved({ x: player.getX(), y: player.getY(), id: player.id });
      }
    } else if (player.getSpeed() === 0) {
      if (player.sprite.key !== 'link-idle-front') {
        player.animationIdle();
        crystalChase.network.playerStoped({ x: player.getX(), y: player.getY(), id: player.id });
      }
    }
  },

  render: function render() {},
};

document.addEventListener('DOMContentLoaded', () => {
  crystalChase.gameWrap.initGame();
});
