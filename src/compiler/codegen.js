
export function generate (
  ast,
) {
  const code = ast ? genElement(ast) : '_c("div")';
  return `with(this){return ${code}}`;
}

function genElement (node) {
  let tempStr = '';
  // 如果node是个dom节点
  if (node.type === 1) {
    // 无子元素
    if (node.children.length === 0) {
      tempStr = `_c('${node.tag}',${JSON.stringify(node.attrsMap)})`;
    } else { // 有子元素
      const children = node.children;
      let h_childs = [];
      for (let i = 0; i < children.length; i++) {
        h_childs.push(genElement(children[i]));
      }
      h_childs = '[' + h_childs.join(',') + ']';
      tempStr = `_c('${node.tag}',${JSON.stringify(node.attrsMap)},${h_childs})`;
    }
  } else if (node.type === 2) { // 如果node是文字
    tempStr = node.expression ? node.expression : `'${node.text}'`;
    tempStr = tempStr.replace(/\n|\r/g, '');
  }
  return tempStr;
}
