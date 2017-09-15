/* globals crystalChase */
// eslint-disable-next-line no-unused-vars
crystalChase.utils = {

  randomNumber: max => Math.floor(Math.random() * max) + 1,

  generateId: () => {
    const number = Math.random();
    number.toString(36);
    const id = number.toString(36).substr(2, 9);
    return id;
  },

  mapNumber: (number, inMin, inMax, outMin, outMax) => {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
};
