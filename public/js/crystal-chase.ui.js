crystalChase.ui = {
  prepJoinBox: function prepJoinBox() {
    const nameInput = document.querySelector('#nameInput');
    const joinBtn = document.querySelector('#joinBtn');
    const nameHelp = document.querySelector('#nameHelp');
    const joinBox = document.querySelector('#joinBox');

    joinBtn.addEventListener('click', () => {
      if (nameInput.value.length < 3 || nameInput.value.length > 16) {
        nameHelp.style.display = 'block';
      } else {
        joinBox.style.display = 'none';
        crystalChase.gameWrap.joinGame(nameInput.value);
      }
    });
  },
};
