/* globals crystalChase */
// eslint-disable-next-line no-unused-vars
crystalChase.models.Crystal = class {
  constructor(game, sprite, id) {
    this.sprite = sprite;
    this.id = id;
    this.sprite.animations.add('spin');
    this.sprite.animations.play('spin', 20, true);
    game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  }
};
