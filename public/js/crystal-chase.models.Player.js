/* globals crystalChase */
// eslint-disable-next-line no-unused-vars

crystalChase.models.Player = class {
  constructor(game, sprite, id) {
    this.game = game;
    this.sprite = sprite;
    this.id = id;

    this.sprite.scale.setTo(0.7);
    this.sprite.anchor.set(0.5);
    this.sprite.smoothed = false;
    this.sprite.animations.add('walk');
    this.sprite.animations.add('idle');
    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.sprite.body.maxVelocity.x = defaultSpeed;
    this.sprite.body.maxVelocity.y = defaultSpeed;
    this.sprite.body.drag.x = defaultDrag;
    this.sprite.body.drag.y = defaultDrag;
  }

  getX() { return this.sprite.x; }
  getY() { return this.sprite.y; }

  setX(x) { this.sprite.x = x; }
  setY(y) { this.sprite.y = y; }

  getSpeed() { return this.sprite.body.speed; }

  stopMoving() {
    this.sprite.body.acceleration.x = 0;
    this.sprite.body.acceleration.y = 0;
  }

  moveLeft() {
    this.sprite.body.acceleration.x -= defaultAcc;
    this.animationWalkLeft();
  }

  moveRight() {
    this.sprite.body.acceleration.x += defaultAcc;
    this.animationWalkRight();
  }

  moveUp() {
    this.sprite.body.acceleration.y -= defaultAcc;
    this.animationWalkUp();
  }

  moveDown() {
    this.sprite.body.acceleration.y += defaultAcc;
    this.animationWalkDown();
  }

  moveTo(x, y, ms) {
    this.stopMoving();
    if (this.getX() > x) {
      this.moveLeft();
    }
  }

  handleOutOfBounds() {
    if (this.getY() < -mapPadding) {
      this.setY(mapHeight + mapPadding);
      return true;
    }
    if (this.getY() > mapHeight + mapPadding) {
      this.setY(-mapPadding);
      return true;
    }
    if (this.getX() < -mapPadding) {
      this.setX(mapWidth + mapPadding);
      return true;
    }
    if (this.getX() > mapWidth + mapPadding) {
      this.setX(-mapPadding);
      return true;
    }
    return false;
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
