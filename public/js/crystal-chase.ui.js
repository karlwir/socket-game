crystalChase.ui = {
  prepJoinBox: function prepJoinBox() {
    const nameInput = document.querySelector('#nameInput');
    const joinBtn = document.querySelector('#joinBtn');
    const joinBox = document.querySelector('#joinBox');

    joinBtn.addEventListener('click', () => {
      if (nameInput.value.length > 3) {
        joinBox.style.display = 'none';
        crystalChase.gameWrap.joinGame(nameInput.value);
      } else {
        alert('Username to short!');
      }
    });
  },
};
