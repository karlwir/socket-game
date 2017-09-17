crystalChase.gameWrap = {
  game: undefined,
  player: undefined,
  crystal: undefined,
  cursors: undefined,

  soundDing: undefined,
  soundChip: undefined,
  soundSteps: undefined,
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
    this.game = new Phaser.Game(this.mapWidth, this.mapHeight, Phaser.AUTO, 'crystal-chase', { preload: this.preload, create: this.create, update: this.update, render: this.render });
  },

  grabGem: function grabGem() {
    crystalChase.gameWrap.soundDing.play();
    crystalChase.gameWrap.soundChip.play();
    crystalChase.network.crystalGrabbed(
      { playerId: crystalChase.gameWrap.player.id, crystalId: crystalChase.gameWrap.crystal.id });
    crystalChase.gameWrap.crystal.sprite.destroy();
  },

  createPlayer: function createPlayer(x, y, id, name, isPlayer) {
    const newPlayerSprite = this.game.add.sprite(x, y, 'link-idle-front');
    const newPlayer = new crystalChase.models
      .Player(this.game, newPlayerSprite, id, name, isPlayer);
    return newPlayer;
  },

  joinGame: function joinGame(name) {
    const x = crystalChase.utils.randomNumber(crystalChase.gameWrap.mapWidth);
    const y = crystalChase.utils.randomNumber(crystalChase.gameWrap.mapHeight);
    const id = crystalChase.utils.generateId();
    crystalChase.gameWrap.player = crystalChase.gameWrap
      .createPlayer(x, y, id, name, true);
    crystalChase.gameWrap.player.animationIdle();
    crystalChase.network.newPlayer({ x, y, id, name });
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
    this.game.load.audio('sound-steps', 'assets/audio/steps-long.mp3');
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

    crystalChase.gameWrap.soundDing = this.game.add.audio('sound-ding');
    crystalChase.gameWrap.soundChip = this.game.add.audio('sound-chip');
    crystalChase.gameWrap.soundSteps = this.game.add.audio('sound-steps');
    crystalChase.gameWrap.soundTakenTheLead = this.game.add.audio('sound-taken-the-lead');
    crystalChase.gameWrap.soundLostTheLead = this.game.add.audio('sound-lost-the-lead');
    crystalChase.gameWrap.soundBackgroundTune = this.game.add.audio('sound-background-tune');
    crystalChase.gameWrap.soundBackgroundTune.loopFull();

    crystalChase.network.connect();
  },

  update: function update() {
    const player = crystalChase.gameWrap.player;
    const crystal = crystalChase.gameWrap.crystal;
    const cursors = crystalChase.gameWrap.cursors;
    const opponents = crystalChase.gameWrap.opponents;

    if (player) {
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
        if (!player.soundSteps.isPlaying) {
          player.soundSteps.fadeIn(500);
          player.soundSteps.loopFull();
        }
        player.animationWalk();
        if (player.handleOutOfBounds()) {
          crystalChase.network.playerBeamed(player.getData());
        } else {
          crystalChase.network.playerMoved(player.getData());
        }
      } else if (player.getSpeed() === 0) {
        player.soundSteps.fadeOut(300);
        if (player.sprite.key !== 'link-idle-front') {
          player.animationIdle();
          crystalChase.network.playerStoped(player.getData());
        }
      }
      player.moveNameTag();

      Object.keys(opponents).forEach((key) => {
        this.game.physics.arcade
          .collide(player.sprite, opponents[key].sprite, null, null, this);
      });
    }
  },

  render: function render() {},
};

document.addEventListener('DOMContentLoaded', () => {
  crystalChase.gameWrap.initGame();
  crystalChase.ui.prepJoinBox();
});
