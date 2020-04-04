
import { initState } from './state';
import { getOuterHTML, query } from '../utils/index';
import { createCompilerCreator } from '../../compiler/index';
import { initRender, renderMixin } from './render';

import { lifecycleMixin } from './lifecycle';
import { patchInit } from './patch';
import Watcher from '../observer/Watcher';

export default function Kue (options) {
  this._init(options);
}

Kue.prototype._init = function (options) {
  this.$options = options;
  initState(this);
  initRender(this);

  if (this.$options.el) {
    this.$mount(this.$options.el);
  }
}
;

lifecycleMixin(Kue);
patchInit(Kue);
renderMixin(Kue);

Kue.prototype.$mount = function () {
  const options = this.$options;

  this.$el = query(options.el);

  const template = getOuterHTML(this.$el);
  const vm = this;

  // this.$el = template;

  const render = createCompilerCreator(template);
  options.render = render;

  const updateComponent = () => {
    vm._update(vm._render());
  };

  new Watcher(vm, updateComponent, () => {});
}

;
