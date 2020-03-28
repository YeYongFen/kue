import Kue from '../src/core/instance/index.js';

const kue = new Kue({
  el: '#box',
  data: {
    a: 1,
  },
});
