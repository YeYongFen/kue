(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Kue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var uid = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = uid++;
      this.subs = [];
    }

    _createClass(Dep, [{
      key: "addSub",
      value: function addSub(sub) {
        this.subs.push(sub);
      }
    }, {
      key: "removeSub",
      value: function removeSub(sub) {
        remove(this.subs, sub);
      }
    }, {
      key: "depend",
      value: function depend() {
        if (Dep.target) {
          Dep.target.addDep(this);
        }
      }
    }, {
      key: "notify",
      value: function notify() {
        var subs = this.subs.slice();

        for (var i = 0, l = subs.length; i < l; i++) {
          subs[i].update();
        }
      }
    }]);

    return Dep;
  }();
  Dep.target = null;

  function remove(arr, item) {
    if (arr.length) {
      var index = arr.indexOf(item);

      if (index > -1) {
        return arr.splice(index, 1);
      }
    }
  }

  Dep.target = null;
  var targetStack = [];
  function pushTarget(target) {
    targetStack.push(target);
    Dep.target = target;
  }
  function popTarget() {
    targetStack.pop();
    Dep.target = targetStack[targetStack.length - 1];
  }

  function observe(data) {
    var ob = new Observer(data);
  }

  var Observer = /*#__PURE__*/function () {
    function Observer(obj) {
      _classCallCheck(this, Observer);

      this.walk(obj);
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(obj) {
        var keys = Object.keys(obj);

        for (var i = 0; i < keys.length; i++) {
          defineReactive(obj, keys[i]);
        }
      }
    }]);

    return Observer;
  }();

  function defineReactive(obj, key, val) {
    var property = Object.getOwnPropertyDescriptor(obj, key);

    if (property && property.configurable === false) {
      return;
    }

    var dep = new Dep(); // cater for pre-defined getter/setters

    var getter = property && property.get;
    var setter = property && property.set;

    if ((!getter || setter) && arguments.length === 2) {
      val = obj[key];
    }

    Object.defineProperty(obj, key, {
      enumerable: true,
      configurable: true,
      get: function reactiveGetter() {
        var value = getter ? getter.call(obj) : val;

        if (Dep.target) {
          dep.depend();
        }

        return value;
      },
      set: function reactiveSetter(newVal) {}
    });
  }

  function initState(vm) {
    var opt = vm.$options;

    if (opt.data) {
      initData(vm);
    }
  }

  function initData(vm) {
    var data = vm.$options.data;
    vm._data = data;
    observe(data);
  }

  function getOuterHTML(el) {
    if (el.outerHTML) {
      return el.outerHTML;
    } else {
      var container = document.createElement('div');
      container.appendChild(el.cloneNode(true));
      return container.innerHTML;
    }
  }
  function query(el) {
    if (typeof el === 'string') {
      var selected = document.querySelector(el);

      if (!selected) {
        return document.createElement('div');
      }

      return selected;
    } else {
      return el;
    }
  }
  function isType(obj, type) {
    return Object.prototype.toString.call(obj).toLowerCase() === "[object ".concat(type, "]");
  }
  function deepCopy(out) {
    out = out || {};
    var str = JSON.stringify(out);
    return JSON.parse(str);
  }
  function isDef(v) {
    return v !== undefined && v !== null;
  }

  function HtmlParser() {}

  HtmlParser.prototype = {
    handler: null,
    // regexps
    startTagRe: /^<([^>\s\/]+)((\s+[^=>\s]+(\s*=\s*((\"[^"]*\")|(\'[^']*\')|[^>\s]+))?)*)\s*\/?\s*>/m,
    endTagRe: /^<\/([^>\s]+)[^>]*>/m,
    attrRe: /([^=\s]+)(\s*=\s*((\"([^"]*)\")|(\'([^']*)\')|[^>\s]+))?/gm,
    parse: function parse(s, oHandler) {
      if (oHandler) {
        this.contentHandler = oHandler;
      }
      var lm, rc, index;
      var treatAsChars = false;
      var oThis = this;

      while (s.length > 0) {
        // Comment
        if (s.substring(0, 4) == '<!--') {
          index = s.indexOf('-->');

          if (index != -1) {
            this.contentHandler.comment(s.substring(4, index));
            s = s.substring(index + 3);
            treatAsChars = false;
          } else {
            treatAsChars = true;
          }
        } else if (s.substring(0, 2) == '</') {
          // end tag
          if (this.endTagRe.test(s)) {
            lm = RegExp.lastMatch;
            rc = RegExp.rightContext;
            lm.replace(this.endTagRe, function () {
              return oThis.parseEndTag.apply(oThis, arguments);
            });
            s = rc;
            treatAsChars = false;
          } else {
            treatAsChars = true;
          }
        } else if (s.charAt(0) == '<') {
          // start tag
          if (this.startTagRe.test(s)) {
            lm = RegExp.lastMatch;
            rc = RegExp.rightContext;
            lm.replace(this.startTagRe, function () {
              return oThis.parseStartTag.apply(oThis, arguments);
            });
            s = rc;
            treatAsChars = false;
          } else {
            treatAsChars = true;
          }
        }

        if (treatAsChars) {
          index = s.indexOf('<');

          if (index == -1) {
            this.contentHandler.chars(s);
            s = '';
          } else {
            this.contentHandler.chars(s.substring(0, index));
            s = s.substring(index);
          }
        }

        treatAsChars = true;
      }
    },
    parseStartTag: function parseStartTag(sTag, sTagName, sRest) {
      var attrs = this.parseAttributes(sTagName, sRest);
      this.contentHandler.start(sTagName, attrs);
    },
    parseEndTag: function parseEndTag(sTag, sTagName) {
      this.contentHandler.end(sTagName);
    },
    parseAttributes: function parseAttributes(sTagName, s) {
      var oThis = this;
      var attrs = [];
      s.replace(this.attrRe, function (a0, a1, a2, a3, a4, a5, a6) {
        attrs.push(oThis.parseAttribute(sTagName, a0, a1, a2, a3, a4, a5, a6));
      });
      return attrs;
    },
    parseAttribute: function parseAttribute(sTagName, sAttribute, sName) {
      var value = '';

      if (arguments[7]) {
        value = arguments[8];
      } else if (arguments[5]) {
        value = arguments[6];
      } else if (arguments[3]) {
        value = arguments[4];
      }

      var empty = !value && !arguments[3];
      return {
        name: sName,
        value: empty ? null : value
      };
    }
  };
  var parseHTML = new HtmlParser();

  var tagRE = /\{\{((?:.|\n)+?)\}\}/g;
  function parseText(text) {
    // text 如 '{{price}} 元' 或者 '价格 {{price}}' 形式
    if (!tagRE.test(text)) {
      return;
    }

    text = text.trim();
    var tokens = [];
    var lastIndex = tagRE.lastIndex = 0;
    var match, index;

    while (match = tagRE.exec(text)) {
      index = match.index; // push text token

      if (index > lastIndex) {
        // '价格 {{price}}' 情况下，token.push('"价格 "')
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      } // tag token


      var exp = match[1].trim(); // token.push('_s(price)') , _s 在 core/instance/render.js 中定义

      tokens.push("_s(_data.".concat(exp, ")"));
      lastIndex = index + match[0].length;
    }

    if (lastIndex < text.length) {
      // '{{price}} 元' 情况下，token.push('" 元"')
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    } // 最终返回 '_s(price)+" 元"' 或者 '"价格 "+_s(price)'


    return tokens.join('+');
  }

  var onRE = /^@|^m-on:/;
  var dirRE = /^m-|^@|^:/;
  var forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/;
  var forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/;
  var bindRE = /^:|^m-bind:/;
  function parse(template, options) {
    // 节点栈
    var stack = []; // 根节点，最终改回返回

    var root; // 当前的父节点

    var currentParent;
    parseHTML.parse(template, {
      // node 的开始
      start: function start(tag, attrs, unary) {
        // unary 是否一元标签，如 <img/>
        var element = {
          type: 1,
          tag: tag,
          // attrsList 数组形式
          attrsList: attrs,
          // attrsMap 对象形式，如 {id: 'app', 'm-text': 'xxx'}
          attrsMap: makeAttrsMap(attrs),
          parent: currentParent,
          children: []
        }; // 处理 m-for ，生成 element.for, element.alias

        processFor(element); // 处理 m-if ，生成 element.if, element.else, element.elseif

        processIf(element); // 处理 m-once ，生成 element.once

        processOnce(element); // 处理 key ，生成 element.key

        processKey(element); // 处理属性
        // 第一，处理指令：m-bind m-on 以及其他指令的处理
        // 第二，处理普通的 html 属性，如 style class 等

        processAttrs(element); // tree management

        if (!root) {
          // 确定根节点
          root = element;
        }

        if (currentParent) {
          // 当前有根节点
          currentParent.children.push(element);
          element.parent = currentParent;
        }

        if (!unary) {
          // 不是一元标签（<img/> 等）
          currentParent = element;
          stack.push(element);
        }
      },
      // node 的结束
      end: function end() {
        // pop stack
        stack.length -= 1;
        currentParent = stack[stack.length - 1];
      },
      // 字符
      chars: function chars(text) {
        var children = currentParent.children;
        var expression = parseText(text); // 如 '_s(price)+" 元"' ，_s 在 core/instance/render.js 中定义
        // 处理字符

        children.push({
          type: 2,
          expression: expression,
          text: text
        });
      },
      // 注释内容
      comment: function comment(text) {
        currentParent.children.push({
          type: 3,
          text: text,
          isComment: true
        });
      }
    });
    return root;
  }

  function makeAttrsMap(attrs) {
    var map = {};

    for (var i = 0, l = attrs.length; i < l; i++) {
      map[attrs[i].name] = attrs[i].value;
    }

    return map;
  } // 处理 m-for


  function processFor(el) {
    var exp; // 获取表达式，例如 'item in list'

    if (exp = getAndRemoveAttr(el, 'm-for')) {
      // inMatch 即 ['item in list', 'item', 'list']
      var inMatch = exp.match(forAliasRE);

      if (!inMatch) {
        return;
      }

      el["for"] = inMatch[2].trim(); // 'list'

      var alias = inMatch[1].trim(); // 'item'
      // 如果是 '(item, index) in list' 情况下
      // iteratorMatch 即 ["(item, index)", "item", "index", undefined]

      var iteratorMatch = alias.match(forIteratorRE);

      if (iteratorMatch) {
        el.alias = iteratorMatch[1].trim(); // 'item'

        el.iterator1 = iteratorMatch[2].trim(); // 'index'

        if (iteratorMatch[3]) {
          el.iterator2 = iteratorMatch[3].trim();
        }
      } else {
        // 普通的 'item in list' 这种情况
        el.alias = alias; // 'item'
      }
    }
  } // 处理 m-if


  function processIf(el) {
    // 获取表达式
    var exp = getAndRemoveAttr(el, 'm-if');

    if (exp) {
      el["if"] = exp;
    } else {
      if (getAndRemoveAttr(el, 'm-else') != null) {
        el["else"] = true;
      }

      var elseif = getAndRemoveAttr(el, 'm-else-if');

      if (elseif) {
        el.elseif = elseif;
      }
    }
  } // 处理 m-once


  function processOnce(el) {
    var once = getAndRemoveAttr(el, 'm-once');

    if (once != null) {
      el.once = true;
    }
  } // 处理 key


  function processKey(el) {
    var exp = getBindingAttr(el, 'key');

    if (exp) {
      el.key = exp;
    }
  }

  function processAttrs(el) {
    // 获取属性列表
    var list = el.attrsList;
    var i, l, name, rawName, value;

    for (i = 0, l = list.length; i < l; i++) {
      // 获取属性的 name 和 value
      name = rawName = list[i].name;
      value = list[i].value;

      if (dirRE.test(name)) {
        // 如果该属性是指令，如 m- @ : 特性
        // mark element as dynamic
        el.hasBindings = true;

        if (bindRE.test(name)) {
          // m-bind ，如 'm-bind:class'
          name = name.replace(bindRE, ''); // 去掉 name 中的 'm-bind:'
          // el.attrs.push(name, value)

          addAttr(el, name, value);
        } else if (onRE.test(name)) {
          // m-on ，如 'm-on:click'
          name = name.replace(onRE, ''); // 去掉 name 中的 'm-on'
          // el.events[name] = [{value: value}, ...] // 多个事件就数组形式，单个时间就普通对象形式 {value: value}

          addHandler(el, name, value);
        } else {
          // 普通指令 如 m-show
          name = name.replace(dirRE, ''); // 去掉指令前缀 'm-show' -> 'show'
          // el.directives.push({name, rawname, value})

          addDirective(el, name, rawName, value);
        }
      } else {
        // 不是指令
        // 普通属性加入 el.attrs
        // el.attrs.push(name, value)
        addAttr(el, name, JSON.stringify(value));
      }
    }
  }

  function addHandler(el, name, value) {
    var events = el.events || (el.events = {}); // 事件都存储在 el.events 中
    // 新事件

    var newHandler = {
      value: value
    }; // 看是否已有 name 的其他事件

    var handlers = events[name];

    if (Array.isArray(handlers)) {
      handlers.push(newHandler);
    } else if (handlers) {
      events[name] = [handlers, newHandler];
    } else {
      // 存储事件
      events[name] = newHandler;
    }
  }
  function addAttr(el, name, value) {
    (el.attrs || (el.attrs = [])).push({
      name: name,
      value: value
    });
  }
  function addDirective(el, name, rawName, value) {
    (el.directives || (el.directives = [])).push({
      name: name,
      rawName: rawName,
      value: value
    });
  }
  function getAndRemoveAttr(el, name) {
    var val;

    if ((val = el.attrsMap[name]) != null) {
      var list = el.attrsList;

      for (var i = 0, l = list.length; i < l; i++) {
        if (list[i].name === name) {
          list.splice(i, 1);
          break;
        }
      }
    }

    return val;
  }
  function getBindingAttr(el, name, getStatic) {
    var dynamicValue = getAndRemoveAttr(el, ':' + name) || getAndRemoveAttr(el, 'v-bind:' + name);

    if (dynamicValue != null) {
      return parseFilters();
    } else if (getStatic !== false) {
      var staticValue = getAndRemoveAttr(el, name);

      if (staticValue != null) {
        return JSON.stringify(staticValue);
      }
    }
  }

  function parseFilters() {}

  function generate(ast) {
    var code = ast ? genElement(ast) : '_c("div")';
    return "with(this){return ".concat(code, "}");
  }

  function genElement(node) {
    var tempStr = ''; // 如果node是个dom节点

    if (node.type === 1) {
      // 无子元素
      if (node.children.length === 0) {
        tempStr = "_c('".concat(node.tag, "',").concat(JSON.stringify(node.attrsMap), ")");
      } else {
        // 有子元素
        var children = node.children;
        var h_childs = [];

        for (var i = 0; i < children.length; i++) {
          h_childs.push(genElement(children[i]));
        }

        h_childs = '[' + h_childs.join(',') + ']';
        tempStr = "_c('".concat(node.tag, "',").concat(JSON.stringify(node.attrsMap), ",").concat(h_childs, ")");
      }
    } else if (node.type === 2) {
      // 如果node是文字
      tempStr = node.expression ? node.expression : "'".concat(node.text, "'");
      tempStr = tempStr.replace(/\n|\r/g, '');
    }

    return tempStr;
  }

  function createCompilerCreator(template) {
    var ast = parse(template.trim()); // 1

    var renderStr = generate(ast);
    return createFunction(renderStr); // return {
    //   ast,
    //   render: code.render,
    // };
  }

  function createFunction(code, errors) {
    try {
      return new Function(code);
    } catch (err) {
      errors.push({
        err: err,
        code: code
      });
      return function () {};
    }
  }

  function initRender(vm) {
    vm._vnode = null;

    vm._c = function (nodeName, attributes, children) {
      var _this = this;

      var node = {};
      var directives = [];
      var mDirect = /^m-/;
      var isNeed = true;

      for (var attr in attributes) {
        if (mDirect.test(attr)) {
          directives.push({
            key: attr,
            prop: attributes[attr]
          });
        }
      } // 只考虑m-if、m-for 的情况


      directives.forEach(function (item) {
        if (item.key === 'm-if') {
          var propValue = new Function("return this.data.".concat(item.prop)).call(_this);
          isNeed = propValue === true;
        } else if (item.key === 'm-model') {
          var _propValue = new Function("return this.data.".concat(item.prop)).call(_this);

          node.value = _propValue;
        }
      }); // 如果

      if (children && isType(children, 'array')) {
        children = children.filter(function (child) {
          return child !== undefined;
        });
      } // 不需要的设置为 undefined


      if (!isNeed) {
        return undefined;
      }

      node = deepCopy({
        tag: nodeName,
        attributes: attributes || {},
        children: children,
        key: attributes && attributes.key
      });
      return node;
    };

    vm._s = function (expression) {
      return expression;
    };
  }
  function renderMixin(Kue) {
    Kue.prototype._render = function () {
      var vm = this;
      var render = vm.$options.render;
      var vnode = render.call(vm);
      return vnode;
    };
  }

  function lifecycleMixin(Kue) {
    Kue.prototype._update = function (vnode) {
      var vm = this;
      var prevEl = vm.$el;
      var prevVnode = vm._vnode;
      vm._vnode = vnode; // Vue.prototype.__patch__ is injected in entry points
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

  function createElement(tagName, vnode) {
    var elm = document.createElement(tagName);

    if (tagName !== 'select') {
      return elm;
    } // false or null will remove the attribute but undefined will not


    if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
      elm.setAttribute('multiple', 'multiple');
    }

    return elm;
  }
  function createTextNode(text) {
    return document.createTextNode(text);
  }
  function appendChild(node, child) {
    node.appendChild(child);
  }
  function parentNode(node) {
    return node.parentNode;
  }
  function tagName(node) {
    return node.tagName;
  }

  var VNode = function VNode(tag, data, elm) {
    _classCallCheck(this, VNode);

    this.tag = tag;
    this.data = data;
    this.elm = elm;
    this.children = [];
  };

  function patch(oldVnode, vnode) {
    var isRealElement = isDef(oldVnode.nodeType);

    if (isRealElement) {
      oldVnode = emptyNodeAt(oldVnode);
    }

    var oldElm = oldVnode.elm;
    var parentElm = parentNode(oldElm);
    createElm(vnode, parentElm);
  }

  function emptyNodeAt(elm) {
    return new VNode(tagName(elm).toLowerCase(), {}, elm);
  }

  function patchInit(Kue) {
    // Kue.prototype.
    Kue.prototype.__patch__ = patch;
  }

  function createElm(vnode, parentElm) {
    var data = vnode.data;
    var children = vnode.children;
    var tag = vnode.tag;

    if (isDef(tag)) {
      vnode.elm = createElement(tag, vnode);
      createChildren(vnode, children);
      insert(parentElm, vnode.elm);
    } else {
      vnode.elm = createTextNode(vnode.text);
      insert(parentElm, vnode.elm);
    }
  }

  function insert(parent, elm) {
    if (isDef(parent)) {
      appendChild(parent, elm);
    }
  }

  function createChildren(vnode, children, insertedVnodeQueue) {
    if (Array.isArray(children)) {
      for (var i = 0; i < children.length; ++i) {
        createElm(children[i], insertedVnodeQueue, vnode.elm);
      }
    } else if (isPrimitive(vnode.text)) {
      appendChild(vnode.elm, createTextNode(String(vnode.text)));
    }
  }

  function isPrimitive(value) {
    return typeof value === 'string' || typeof value === 'number' || // $flow-disable-line
    _typeof(value) === 'symbol' || typeof value === 'boolean';
  }

  var uid$1 = 0;

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, expOrFn, cb) {
      _classCallCheck(this, Watcher);

      this.id = uid$1++;
      this.vm = vm;
      this.expOrFn = expOrFn;
      this.cb = cb;
      this.value = null;
      this.deps = [];
      this.getter = null;

      if (typeof expOrFn === 'function') {
        this.getter = expOrFn;
      } else {
        this.getter = parseGetter(expOrFn);
      }

      this.value = this.get();
    }

    _createClass(Watcher, [{
      key: "update",
      value: function update() {
        var newValue = this.get();
        var oldVal = this.value;
        this.value = newValue;
        this.cb.call(this.bm, newValue, oldVal);
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        dep.addSub(dep);
        this.deps.push(dep);
      }
    }, {
      key: "get",
      value: function get() {
        pushTarget(this);
        var value = this.getter.call(this.bm, this.bm);
        popTarget();
        return value;
      }
    }]);

    return Watcher;
  }();

  var parseGetter = function parseGetter(exp) {
    if (/[^\w.$]/.test(exp)) return;
    return function (obj) {
      return getValue(obj, exp);
    };
  };

  function getValue(target, path) {
    if (path in target) {
      var v = target[path];
      return v;
    }

    var val = target;
    path.split('.').forEach(function (k) {
      val = val[k];
    });
    return val;
  }

  function Kue(options) {
    this._init(options);
  }

  Kue.prototype._init = function (options) {
    this.$options = options;
    initState(this);
    initRender(this);

    if (this.$options.el) {
      this.$mount(this.$options.el);
    }
  };

  lifecycleMixin(Kue);
  patchInit(Kue);
  renderMixin(Kue);

  Kue.prototype.$mount = function () {
    var options = this.$options;
    this.$el = query(options.el);
    var template = getOuterHTML(this.$el);
    var vm = this; // this.$el = template;

    var render = createCompilerCreator(template);
    options.render = render;

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };

    new Watcher(vm, updateComponent, function () {});
  };

  return Kue;

})));
//# sourceMappingURL=index.js.map
