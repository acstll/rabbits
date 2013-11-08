var debounce = require('lodash-node/modern/functions/debounce');
var merge = require('lodash-node/modern/objects/merge');

var binders = require('./binders');
var adapter = require('./adapter');

module.exports = Rabbit;

Rabbit.binders = binders;

Rabbit.config = {
  wait: 150,
  preload: true,
  adapter: adapter
};



function Rabbit (obj, model, map, options) {
  this.bindings = [];
  this.model = model || {};
  this.map = map;
  this.config = merge(Rabbit.config, options || {});
  
  if (obj.nodeType > 0) {
    this.view = {};
    this.el = obj;
  } else {
    this.view = obj;
    this.el = obj.el;
  }

  this.initialize();
  if (this.config.preload) this.render();
}

Rabbit.configure = function (options) {
  merge(Rabbit.config, options || {});
};

Rabbit.prototype.initialize = function initialize () {
  var map = this.map;
  var key, keypath, segments, selector, node, type;

  for (key in map) {
    keypath = map[key];
    segments = key.split(/\s/);
    selector = segments[0];
    node = query(this.el, selector);
    type = segments[1] || 'text';

    if (!node) throw new Error('No element found using the provided selector');

    this.bindings.push(new Binding(this, node, type, keypath));
  }
};

Rabbit.prototype.render = function render () {
  this.bindings.forEach(function (binding) {
    binding.sync();
  });
};

Rabbit.prototype.remove = function remove () {
  this.bindings.forEach(function (binding) {
    binding.remove();
  });
};



function Binding (rabbit, node, type, keypath) {
  this.rabbit = rabbit;
  this.el = node;
  this.keypath = keypath;
  this.adapter = rabbit.config.adapter;
  this.binder = binders[type];
  this.callback = this.sync.bind(this);
  
  this.create();
}

Binding.prototype.create = function create () {
  var oncreate = this.binder.oncreate;
  var subscribe = this.adapter.subscribe;
  var model = this.rabbit.model;

  this.setFn();
  
  subscribe(model, this.keypath, this.callback);
  if (typeof oncreate === 'function') oncreate.call(this, this.el);
};

Binding.prototype.setFn = function setFn () {
  var binder = this.binder;
  
  if (typeof binder === 'function') {
    this.fn = binder;
    return;
  }

  if (typeof binder.callback === 'function') {
    this.fn = binder.callback;
    return;
  }

  throw new Error('No callback found in binder');
};

Binding.prototype.remove = function remove () {
  var onremove = this.binder.onremove;
  var unsubscribe = this.adapter.unsubscribe;
  var model = this.rabbit.model;
   
  unsubscribe(model, this.keypath, this.callback);
  if (typeof onremove === 'function') onremove.call(this, this.el);
};
 
Binding.prototype.sync = function sync () {
  var value = this.read();
  
  this.fn.call(this, this.el, value);
};
 
Binding.prototype.read = function read () {
  var model = this.rabbit.model;
  var get = this.adapter.get;
  var values = this.binder.values;
  var self = this;
  var obj = {};

  if (values) {
    values.forEach(function (key) {
      obj[key] = get(model, self.keypath);
    });

    return obj;
  }

  return get(model, this.keypath);
};

// Binding.prototype.publish = function () {};



function query (el, selector) {
  if (selector === '.') return el;
  return el.querySelector(selector);
}

function parse (keypath) {
  if (typeof keypath === 'string') {
    // ...
  }

  if (typeof keypath === 'object') {
    // ...
  }
}