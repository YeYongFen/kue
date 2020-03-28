
export function lifecycleMixin (Kue) {
  Kue.prototype._update = function (vnode) {
    const vm = this;
    const prevEl = vm.$el;
    const prevVnode = vm._vnode;
    vm._vnode = vnode;
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode);
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode);
    }
    if (prevEl) {
      prevEl.__vue__ = null;
    }
    if (vm.$el) {
      vm.$el.__vue__ = vm;
    }
  };
}
