import { pushTarget, popTarget } from './Dep';

let uid = 0;

export default class Watcher {
  constructor (vm, expOrFn, cb) {
    this.id = uid++;
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

  update () {
    const newValue = this.get();
    const oldVal = this.value;
    this.value = newValue;
    this.cb.call(this.bm, newValue, oldVal);
  }

  addDep (dep) {
    dep.addSub(dep);
    this.deps.push(dep);
  }

  get () {
    pushTarget(this);
    const value = this.getter.call(this.bm, this.bm);
    popTarget();
    return value;
  }
}

const parseGetter = (exp) => {
  if (/[^\w.$]/.test(exp)) return;

  return (obj) => getValue(obj, exp);
};

function getValue (target, path) {
  if (path in target) {
    const v = target[path];
    return v;
  }
  let val = target;
  path.split('.').forEach(k => {
    val = val[k];
  });
  return val;
};
