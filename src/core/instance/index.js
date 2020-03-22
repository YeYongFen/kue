
import { initState } from './state';

function Kue () {

}

Kue.prototype._init = function (options) {
  this.$options = options;
  initState(this);
}
;
