/* globals crystalChase */
// eslint-disable-next-line no-unused-vars
crystalChase.utils = {

  randomNumber: max => Math.floor(Math.random() * max) + 1,

  uuidv4: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16 | 0,
      v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }),

  mapNumber: (number, inMin, inMax, outMin, outMax) => {
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
};
