import { observe } from '../observer/index.js';

export function initState (vm) {
  const opt = vm.$options;

  if (opt.data) {
    initData(vm);
  }
}

function initData (vm) {
  const data = vm.$options.data;
  vm._data = data;
  observe(data);
}
