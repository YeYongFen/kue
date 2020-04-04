
/**
 * Cross-platform codegen helper for generating v-model value assignment code.
 */
export function genAssignmentCode (
  value,
  assignment
) {
  const res = parseModel(value);
  if (res.key === null) {
    return `${value}=${assignment}`;
  } else {
    return `$set(${res.exp}, ${res.key}, ${assignment})`;
  }
}

let len, str, chr, index, expressionPos, expressionEndPos;

export function parseModel (val) {
  // Fix https://github.com/vuejs/vue/pull/7730
  // allow v-model="obj.val " (trailing whitespace)
  val = val.trim();
  len = val.length;

  if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
    index = val.lastIndexOf('.');
    if (index > -1) {
      return {
        exp: val.slice(0, index),
        key: '"' + val.slice(index + 1) + '"',
      };
    } else {
      return {
        exp: val,
        key: null,
      };
    }
  }

  str = val;
  index = expressionPos = expressionEndPos = 0;

  while (!eof()) {
    chr = next();
    /* istanbul ignore if */
    if (isStringStart(chr)) {
      parseString(chr);
    } else if (chr === 0x5B) {
      parseBracket(chr);
    }
  }

  return {
    exp: val.slice(0, expressionPos),
    key: val.slice(expressionPos + 1, expressionEndPos),
  };
}

function next () {
  return str.charCodeAt(++index);
}

function eof () {
  return index >= len;
}

function isStringStart (chr) {
  return chr === 0x22 || chr === 0x27;
}

function parseBracket (chr) {
  let inBracket = 1;
  expressionPos = index;
  while (!eof()) {
    chr = next();
    if (isStringStart(chr)) {
      parseString(chr);
      continue;
    }
    if (chr === 0x5B) inBracket++;
    if (chr === 0x5D) inBracket--;
    if (inBracket === 0) {
      expressionEndPos = index;
      break;
    }
  }
}

function parseString (chr) {
  const stringQuote = chr;
  while (!eof()) {
    chr = next();
    if (chr === stringQuote) {
      break;
    }
  }
}
