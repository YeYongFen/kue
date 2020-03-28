
export function getOuterHTML (el) {
  el = query(el);
  if (el.outerHTML) {
    return el.outerHTML;
  } else {
    const container = document.createElement('div');
    container.appendChild(el.cloneNode(true));
    return container.innerHTML;
  }
}

export function query (el) {
  if (typeof el === 'string') {
    const selected = document.querySelector(el);
    if (!selected) {
      return document.createElement('div');
    }
    return selected;
  } else {
    return el;
  }
}

export function isType (obj, type) {
  return Object.prototype.toString.call(obj).toLowerCase() === `[object ${type}]`;
}

export function deepCopy (out) {
  out = out || {};

  const str = JSON.stringify(out);

  return JSON.parse(str);
};
