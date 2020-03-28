function createElement (node, isSvg) {
  const _mue = this;
  const element =
            typeof node === 'string' || typeof node === 'number'
              ? document.createTextNode(node)
              : (isSvg = isSvg || node.nodeName === 'svg')
                ? document.createElementNS(
                  'http://www.w3.org/2000/svg',
                  node.nodeName
                )
                : document.createElement(node.nodeName);

  // 嵌套创建
  if (node.children instanceof Array) {
    for (let i = 0; i < node.children.length; i++) {
      element.appendChild(
        this.createElement(node.children[i])
      );
    }
  }

  // 如果是input标签
  if (node.nodeName === 'input') {
    element.value = node.value;
    element.addEventListener('input', function (e) {
      const expression = node.attributes['m-model'];
      const val = e.target.value;
      const str = `this.data.${expression}='${val}'`;
      (new Function(str)).call(_mue);
    });
  }

  return element;
};

function patch (parent, element, oldNode, node, isSvg) {
  // 同一个node树，什么也不处理
  if (node === oldNode) {
  } else if (oldNode == null || oldNode.nodeName !== node.nodeName) { // 第一次patch，直接创建DOM树
    const newElement = this.createElement(node, isSvg);
    parent.insertBefore(newElement, element);

    if (oldNode != null) {
      removeElement(parent, element, oldNode);
    }

    element = newElement;
  } else if (oldNode.nodeName == null) { // 只有文字
    element.nodeValue = node;
  } else { // 新旧DOM树有所不同，进行diff修改更新DOM
    const oldKeyed = {};
    const newKeyed = {};
    const oldElements = [];
    const oldChildren = oldNode.children;
    const children = node.children;

    for (let i = 0; i < oldChildren.length; i++) {
      oldElements[i] = element.childNodes[i];

      const oldKey = getKey(oldChildren[i]);
      if (oldKey != null) {
        oldKeyed[oldKey] = [oldElements[i], oldChildren[i]];
      }
    }

    let i = 0;
    let k = 0;

    while (children && k < children.length) {
      const oldKey = getKey(oldChildren[i]);
      const newKey = getKey((children[k]));

      // 新node树中还存在的旧节点保留
      if (newKeyed[oldKey]) {
        i++;
        continue;
      }

      if (newKey != null && newKey === getKey(oldChildren[i + 1])) {
        if (oldKey == null) {
          removeElement(element, oldElements[i], oldChildren[i]);
        }
        i++;
        continue;
      }

      if (newKey == null) {
        if (oldKey == null) {
          patch(element, oldElements[i], oldChildren[i], children[k], isSvg);
          k++;
        }
        i++;
      } else {
        const keyedNode = oldKeyed[newKey] || [];

        if (oldKey === newKey) {
          patch(element, keyedNode[0], keyedNode[1], children[k], isSvg);
          i++;
        } else if (keyedNode[0]) {
          patch(
            element,
            element.insertBefore(keyedNode[0], oldElements[i]),
            keyedNode[1],
            children[k],
            isSvg
          );
        } else {
          patch(element, oldElements[i], null, children[k], isSvg);
        }

        newKeyed[newKey] = children[k];
        k++;
      }
    }

    while (i < oldChildren.length) {
      if (getKey(oldChildren[i]) == null) {
        removeElement(element, oldElements[i], oldChildren[i]);
      }
      i++;
    }

    for (const i in oldKeyed) {
      if (!newKeyed[i]) {
        removeElement(element, oldKeyed[i][0], oldKeyed[i][1]);
      }
    }
  }
  return element;
};

export function patchInit (Kue) {
  // Kue.prototype.

  Kue.prototype.__patch__ = patch;
}

function getKey (node) {
  return node ? node.key : null;
}

function removeChildren (element, node) {
  const attributes = node.attributes;
  if (attributes) {
    for (let i = 0; i < node.children.length; i++) {
      removeChildren(element.childNodes[i], node.children[i]);
    }

    if (attributes.ondestroy) {
      attributes.ondestroy(element);
    }
  }
  return element;
}

function removeElement (parent, element, node) {
  function done () {
    parent.removeChild(removeChildren(element, node));
  }

  const cb = node.attributes && node.attributes.onremove;
  if (cb) {
    cb(element, done);
  } else {
    done();
  }
}
