var merge = require('lodash-node/modern/objects/merge');
var Binding = require('./binding');

var adapter = require('./adapter');
var binders = Rabbit.binders = require('./binders');
var formatters = Rabbit.formatters = {};

module.exports = Rabbit;

Rabbit.config = {
  wait: 150,
  preload: true,
  adapter: adapter,
  binders: binders,
  formatters: formatters
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



function query (el, selector) {
  if (selector === '.') return el;
  return el.querySelector(selector);
}