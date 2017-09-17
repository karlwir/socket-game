crystalChase.models.Player = class {
  constructor(game, sprite, id, name) {
    this.game = game;
    this.sprite = sprite;
    this.id = id;
    this.name = name;
    this.inTheLead = false;

    this.nameTagStyle = {
      font: '12px Courier',
      fill: '#ffffff',
      wordWrap: true,
      wordWrapWidth: sprite.width,
      align: 'center',
    };
    this.nameTag = game.add.text(this.getX(), this.getY() - 24, this.name, this.nameTagStyle);
    this.nameTag.anchor.set(0.5);

    this.sprite.scale.setTo(0.75);
    this.sprite.anchor.set(0.5);
    this.sprite.smoothed = false;
    this.sprite.animations.add('walk');
    this.sprite.animations.add('idle');
    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.maxVelocity.x = crystalChase.gameWrap.defaultSpeed;
    this.sprite.body.maxVelocity.y = crystalChase.gameWrap.defaultSpeed;
    this.sprite.body.drag.x = crystalChase.gameWrap.defaultDrag;
    this.sprite.body.drag.y = crystalChase.gameWrap.defaultDrag;

    this.soundSteps = this.game.add.audio('sound-steps');
  }

  getX() { return this.sprite.x; }
  getY() { return this.sprite.y; }

  setX(x) { this.sprite.x = x; }
  setY(y) { this.sprite.y = y; }

  getSpeed() { return this.sprite.body.speed; }

  getData() { return { x: this.getX(), y: this.getY(), id: this.id, name: this.name }; }

  stopMoving() {
    this.sprite.body.acceleration.x = 0;
    this.sprite.body.acceleration.y = 0;
  }

  moveLeft() {
    this.sprite.body.acceleration.x -= crystalChase.gameWrap.defaultAcc;
    this.animationWalkLeft();
  }

  moveRight() {
    this.sprite.body.acceleration.x += crystalChase.gameWrap.defaultAcc;
    this.animationWalkRight();
  }

  moveUp() {
    this.sprite.body.acceleration.y -= crystalChase.gameWrap.defaultAcc;
    this.animationWalkUp();
  }

  moveDown() {
    this.sprite.body.acceleration.y += crystalChase.gameWrap.defaultAcc;
    this.animationWalkDown();
  }

  handleOutOfBounds() {
    if (this.getY() < -crystalChase.gameWrap.mapPadding) {
      this.setY(crystalChase.gameWrap.mapHeight + crystalChase.gameWrap.mapPadding);
      return true;
    }
    if (this.getY() > crystalChase.gameWrap.mapHeight + crystalChase.gameWrap.mapPadding) {
      this.setY(-crystalChase.gameWrap.mapPadding);
      return true;
    }
    if (this.getX() < -crystalChase.gameWrap.mapPadding) {
      this.setX(crystalChase.gameWrap.mapWidth + crystalChase.gameWrap.mapPadding);
      return true;
    }
    if (this.getX() > crystalChase.gameWrap.mapWidth + crystalChase.gameWrap.mapPadding) {
      this.setX(-crystalChase.gameWrap.mapPadding);
      return true;
    }
    return false;
  }

  moveNameTag() {
    this.nameTag.x = this.getX();
    this.nameTag.y = this.getY() - 24;
  }

  animationWalk() {
    this.sprite.animations.play('walk', 20, true);
  }

  animationWalkLeft() {
    if (this.sprite.key !== 'link-walk-left') {
      if (this.sprite.body.velocity.y === 0) {
        this.sprite.loadTexture('link-walk-left', 0);
      }
    }
    this.animationWalk();
  }

  animationWalkRight() {
    if (this.sprite.key !== 'link-walk-right') {
      if (this.sprite.body.velocity.y === 0) {
        this.sprite.loadTexture('link-walk-right', 0);
      }
    }
    this.animationWalk();
  }

  animationWalkUp() {
    if (this.sprite.key !== 'link-walk-back') {
      this.sprite.loadTexture('link-walk-back', 0);
    }
    this.animationWalk();
  }

  animationWalkDown() {
    if (this.sprite.key !== 'link-walk-front') {
      this.sprite.loadTexture('link-walk-front', 0);
    }
    this.animationWalk();
  }

  animationIdle() {
    if (this.sprite.key !== 'link-idle-front') {
      this.sprite.loadTexture('link-idle-front', 0);
    }
    this.sprite.animations.play('idle', 2, true);
  }
};
