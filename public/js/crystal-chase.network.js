crystalChase.network = {
  socket: {},

  connect: function connect() {
    crystalChase.network.socket = io.connect('http://localhost:8080');
    // crystalChase.network.const socket = io.connect('https://intense-lowlands-35644.herokuapp.com/');
    // crystalChase.network.const socket = io.connect('http://172.26.32.232:8080');

    crystalChase.network.socket.on('playerJoined', (data) => {
      const newOpponent = crystalChase.gameWrap.createPlayer(data.x, data.y, data.id);
      crystalChase.gameWrap.opponents[data.id] = newOpponent;
      newOpponent.animationIdle();
    });

    crystalChase.network.socket.on('opponentMoved', (data) => {
      const opponent = crystalChase.gameWrap.opponents[data.id];
      if (opponent) {
        if (!opponent.soundSteps.isPlaying) {
          opponent.soundSteps.fadeIn(500);
          opponent.soundSteps.loopFull();
        } else {
          const dist = crystalChase.gameWrap.game.physics.arcade
            .distanceBetween(opponent.sprite, crystalChase.gameWrap.player.sprite);
          const stepVolume = crystalChase.utils
            .mapNumber(dist, 0, crystalChase.gameWrap.mapWidth, 1, 0.1);

          opponent.soundSteps.fadeTo(50, stepVolume);
        }
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

    crystalChase.network.socket.on('opponentBeamed', (data) => {
      const opponent = crystalChase.gameWrap.opponents[data.id];
      if (opponent) {
        opponent.setX(data.x);
        opponent.setY(data.y);
      }
    });

    crystalChase.network.socket.on('opponentStoped', (data) => {
      const opponent = crystalChase.gameWrap.opponents[data.id];
      if (opponent) {
        opponent.soundSteps.fadeOut(300);
        opponent.animationIdle();
      }
    });

    crystalChase.network.socket.on('playerLeft', (data) => {
      const opponent = crystalChase.gameWrap.opponents[data.id];
      if (opponent) {
        crystalChase.gameWrap.opponents.splice(data.id, 1);
        opponent.sprite.destroy();
      }
    });

    crystalChase.network.socket.on('newCrystal', (data) => {
      const newCrystalSprite = crystalChase.gameWrap.game.add.sprite(data.x, data.y, 'gem-green-spin');
      crystalChase.gameWrap.crystal =
        new crystalChase.models.Crystal(crystalChase.gameWrap.game, newCrystalSprite, data.id);
    });

    crystalChase.network.socket.on('newScores', (data) => {
      crystalChase.scoreBoard.updateScoreboard(data);
    });

    crystalChase.network.socket.on('opponentGrabbedCrystal', () => {
      crystalChase.gameWrap.soundChip.play();
      if (crystalChase.gameWrap.crystal) {
        crystalChase.gameWrap.crystal.sprite.destroy();
      }
    });
  },

  crystalGrabbed: function crystalGrabbed(data) {
    crystalChase.network.socket.emit('crystalGrabbed', data);
  },

  newPlayer: function newPlayer(data) {
    crystalChase.network.socket.emit('newPlayer', data);
  },

  playerBeamed: function playerBeamed(data) {
    crystalChase.network.socket.emit('playerBeamed', data);
  },

  playerMoved: function playerMoved(data) {
    crystalChase.network.socket.emit('playerMoved', data);
  },

  playerStoped: function playerStoped(data) {
    crystalChase.network.socket.emit('playerStoped', data);
  },
};
