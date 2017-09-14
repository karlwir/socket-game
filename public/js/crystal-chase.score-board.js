crystalChase.scoreBoard = {
  updateScoreboard: function updateScoreboard(data) {
    const scoreTable = document.querySelector('#scores');
    const player = crystalChase.gameWrap.player;
    while (scoreTable.firstChild) {
      scoreTable.removeChild(scoreTable.firstChild);
    }
    let rank = 0;
    let lastScore;
    data.forEach((dataRow) => {
      if (lastScore !== dataRow.value) {
        rank += 1;
      }
      const tr = document.createElement('tr');
      const thRank = document.createElement('th');
      thRank.innerText = rank;
      const tdName = document.createElement('td');
      tdName.innerText = dataRow.key;
      const tdScore = document.createElement('td');
      tdScore.innerText = dataRow.value;
      lastScore = dataRow.value;

      if (dataRow.key === player.id) {
        tr.classList.add('current-player');
      }

      if (!player.inTheLead && rank === 1 && dataRow.key === player.id) {
        crystalChase.gameWrap.soundTakenTheLead.play();
        player.inTheLead = true;
      } else if (rank === 2 && dataRow.key === player.id && player.inTheLead) {
        crystalChase.gameWrap.soundLostTheLead.play();
        player.inTheLead = false;
      }

      tr.appendChild(thRank);
      tr.appendChild(tdName);
      tr.appendChild(tdScore);

      scoreTable.appendChild(tr);
    });
  },
};
