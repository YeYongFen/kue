
import { parse } from './parser';
import { generate } from './codegen';

export function createCompilerCreator (template) {
  const ast = parse(template.trim()); // 1

  const renderStr = generate(ast);

  return createFunction(renderStr);
  // return {
  //   ast,
  //   render: code.render,
  // };
}

function createFunction (code, errors) {
  try {
    return new Function(code);
  } catch (err) {
    errors.push({ err, code, });
    return () => {};
  }
}
