import { observe } from '../observer/index.js';

export function initState (vm) {
  const opt = vm.$options;

  if (opt.data) {
    initData(opt.data);
  }
}

function initData (data) {
  observe(data);
}
