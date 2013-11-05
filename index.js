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
  this.render();
}

Rabbit.configure = function (options) {
  merge(Rabbit.config, options || {});
};

Rabbit.prototype.initialize = function initialize () {
  var self = this;
  var map = this.map;
  var keys = Object.keys(map);
  
  keys.forEach(function (key) {
    var binding;
    var keypath = map[key];
    var segments = key.split(/\s/);
    var selector = segments[0];
    var node = query(self.el, selector);
    var type = segments[1] || 'text';

    if (!node) throw new Error('No element found using provided selector');

    binding = new Binding(self, node, type, keypath);
    self.bindings.push(binding);
  });
};

Rabbit.prototype.render = function render () {
  this.bindings.forEach(function (binding) {
    binding.sync();
  });
};

Rabbit.prototype.unbind = function unbind () {
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

Binding.prototype.setFn = function setFn () {
  var binder = this.binder;
  
  if (typeof binder === 'function') {
    this.fn = this.binder;
    return;
  }

  if (typeof binder.callback === 'function') {
    this.fn = this.binder.callback;
    return;
  }

  throw new Error('No callback found in binder');
};

Binding.prototype.create = function create () {
  var oncreate = this.binder.oncreate;
  var subscribe = this.adapter.subscribe;
  var model = this.rabbit.model;

  this.setFn();
  subscribe(model, this.keypath, this.callback);
  if (typeof oncreate === 'function') oncreate.call(this, this.el);
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