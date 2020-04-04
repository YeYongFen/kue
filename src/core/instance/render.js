import { deepCopy, isType } from '../utils/index';

export function initRender (vm) {
  vm._vnode = null;
  vm._c = function (nodeName, attributes, children) {
    let node = {};
    const directives = [];
    const mDirect = /^m-/;
    let isNeed = true;

    for (const attr in attributes) {
      if (mDirect.test(attr)) {
        directives.push({
          key: attr,
          prop: attributes[attr],
        });
      }
    }

    // 只考虑m-if、m-for 的情况
    directives.forEach(item => {
      if (item.key === 'm-if') {
        const propValue = new Function(`return this.data.${item.prop}`).call(this);
        isNeed = propValue === true;
      } else if (item.key === 'm-model') {
        const propValue = new Function(`return this.data.${item.prop}`).call(this);
        node.value = propValue;
      }
    });

    // 如果
    if (children && isType(children, 'array')) {
      children = children.filter(child => {
        return child !== undefined;
      });
    }

    // 不需要的设置为 undefined
    if (!isNeed) {
      return undefined;
    }

    node = deepCopy({
      tag: nodeName,
      attributes: attributes || {},
      children: children,
      key: attributes && attributes.key,
    }, node);
    return node;
  };

  vm._s = function (expression) {
    return expression;
  };
}

export function renderMixin (Kue) {
  Kue.prototype._render = function () {
    const vm = this;
    const { render, } = vm.$options;

    const vnode = render.call(vm);

    return vnode;
  };
}
