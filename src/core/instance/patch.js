import { isDef } from '../utils/index';
import * as nodeOps from '../utils/node-ops';
import VNode from '../vdom/vnode'; ;

function patch (oldVnode, vnode) {
  const isRealElement = isDef(oldVnode.nodeType);

  if (isRealElement) {
    oldVnode = emptyNodeAt(oldVnode);
  }

  const oldElm = oldVnode.elm;
  const parentElm = nodeOps.parentNode(oldElm);

  createElm(vnode, parentElm);
};

function emptyNodeAt (elm) {
  return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, elm);
}

export function patchInit (Kue) {
  // Kue.prototype.

  Kue.prototype.__patch__ = patch;
}

function createElm (
  vnode,
  parentElm,

) {
  const data = vnode.data;
  const children = vnode.children;
  const tag = vnode.tag;
  if (isDef(tag)) {
    vnode.elm = nodeOps.createElement(tag, vnode);

    createChildren(vnode, children);

    insert(parentElm, vnode.elm);
  } else {
    vnode.elm = nodeOps.createTextNode(vnode.text);
    insert(parentElm, vnode.elm);
  }
}

function insert (parent, elm) {
  if (isDef(parent)) {
    nodeOps.appendChild(parent, elm);
  }
}

function createChildren (vnode, children, insertedVnodeQueue) {
  if (Array.isArray(children)) {
    for (let i = 0; i < children.length; ++i) {
      createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
    }
  } else if (isPrimitive(vnode.text)) {
    nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
  }
}

export function isPrimitive (value) {
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    // $flow-disable-line
    typeof value === 'symbol' ||
    typeof value === 'boolean'
  );
}
