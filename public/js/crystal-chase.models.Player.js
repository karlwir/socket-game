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
  }

  moveLeft(acceleration) {
    this.sprite.body.acceleration.x -= acceleration;
    if (this.sprite.key !== 'link-walk-left') {
      this.sprite.loadTexture('link-walk-left', 0);
    }
  }

  moveRight(acceleration) {
    this.sprite.body.acceleration.x += acceleration;
    if (this.sprite.key !== 'link-walk-right') {
      this.sprite.loadTexture('link-walk-', 0);
    }
  }

  moveUp(acceleration) {
    this.sprite.body.acceleration.y -= acceleration;
    if (this.sprite.key !== 'link-walk-back') {
      this.sprite.loadTexture('link-walk-back', 0);
    }
  }

  moveDown(acceleration) {
    this.sprite.body.acceleration.y += acceleration;
    if (this.sprite.key !== 'link-walk-front') {
      this.sprite.loadTexture('link-walk-front', 0);
    }
  }

  animationWalk() {
    this.sprite.animations.play('walk', 20, true);
  }

  animationIdle() {
    this.sprite.animations.play('idle', 2, true);
  }
};
