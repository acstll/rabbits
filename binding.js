var debounce = require('lodash-node/modern/functions/debounce');



module.exports = Binding;

function Binding (rabbit, node, type, keypath) {
  this.rabbit = rabbit;
  this.el = node;
  this.options = parse(keypath);
  this.adapter = rabbit.config.adapter;
  this.binder = rabbit.config.binders[type];
  this.formatters = rabbit.config.formatters;

  if (!this.binder) throw new Error('Binder not found: ' + type);
  
  this.create();
}

Binding.prototype.create = function create () {
  var subscribe = this.adapter.subscribe;
  var binder = this.binder;
  var model = this.rabbit.model;
  var wait = this.rabbit.config.wait || 150;

  if (typeof binder === 'function') {
    this.fn = binder;
  } else if (typeof binder.callback === 'function') {
    this.fn = binder.callback;
  } else {
    throw new Error('No callback found in binder');
  }

  if (binder.event) {
    this.listener = debounce(this.publish.bind(this), wait);
    this.el.addEventListener(binder.event, this.listener, false);
  }
  
  if (typeof binder.oncreate === 'function')
    binder.oncreate.call(this, this.el);

  this.callback = this.read.bind(this);
  subscribe(model, this.options, this.callback);
};

Binding.prototype.remove = function remove () {
  var binder = this.binder;
  var unsubscribe = this.adapter.unsubscribe;
  var model = this.rabbit.model;
   
  if (binder.event)
    this.el.removeEventListener(binder.event, this.listener, false);

  if (typeof binder.onremove === 'function')
    binder.onremove.call(this, this.el);
  
  unsubscribe(model, this.options, this.callback);
};
 
Binding.prototype.read = function read () {
  var model = this.rabbit.model;
  var keypath = this.options.keypath;
  var get = this.adapter.get;
  var keys = this.binder.values;
  var value;

  if (keys) {
    value = {};
    keys.forEach(function (key) {
      value[key] = get(model, keypath);
    });
  } else {
   value = get(model, keypath);
  }

  this.fn.call(this, this.el, value);
};

Binding.prototype.publish = function publish () {
  var model = this.rabbit.model;
  var keypath = this.options.keypath;
  var set = this.adapter.set;
  var value = getValue(this.el);

  set(model, keypath, value);
};



function parse (keypath) {
  if (typeof keypath === 'object') return keypath;
  return {
    keypath: keypath
  };
}

function getValue (el) {
  // TODO: <select>
  return el.value
    ? el.value
    : el.innerText;
}