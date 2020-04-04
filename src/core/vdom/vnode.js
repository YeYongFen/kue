
export default class VNode {
  constructor (tag, data, elm) {
    this.tag = tag;
    this.data = data;
    this.elm = elm;
    this.children = [];
  }
}
