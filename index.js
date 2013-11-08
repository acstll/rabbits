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
    binding.read();
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
  this.options = parse(keypath);
  this.adapter = rabbit.config.adapter;
  this.binder = binders[type];

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



function query (el, selector) {
  if (selector === '.') return el;
  return el.querySelector(selector);
}

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