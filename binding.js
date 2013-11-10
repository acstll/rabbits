// var debounce = require('lodash-node/modern/functions/debounce');
var debounce = require('mout/function/debounce');



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
  var view = this.rabbit.view;
  var keypath = this.options.keypath;
  var get = this.adapter.get;
  var keys = this.binder.values;
  var value;

  if (keys) {
    value = {};
    keys.forEach(function (key) {
      value[key] = this.format(get(model, keypath), 'read');
    }, this);
  } else if (typeof view[keypath] === 'function') {
    value = view[keypath]();
  } else {
    value = this.format(get(model, keypath), 'read');
  }

  this.fn.call(this, this.el, value);
};

Binding.prototype.publish = function publish () {
  var model = this.rabbit.model;
  var keypath = this.options.keypath;
  var set = this.adapter.set;
  var value = this.format(getValue(this.el), 'publish');

  set(model, keypath, value);
};

Binding.prototype.format = function format (value, action) {
  var formatters = this.options.formatters || [];
  var length = formatters.length;
  var args, name, fn;

  if (!length) return value;

  if (action === 'publish') {
    for (var i = length - 1; i >= 0; i--) {
      value = _format.call(this, value, formatters[i]);
    }
  }

  if (action === 'read') {
    for (var i = 0; i < length; i++) {
      value = _format.call(this, value, formatters[i]);
    }
  }

  return value;
  
  function _format (_value, formatter) {
    args = formatter.split(' ');
    name = args.shift();
    args.unshift(_value);
    fn = this.formatters[name][action] || this.formatters[name];
    if (typeof fn === 'function') return fn.apply(this, args);
    return _value;
  }
};



function parse (keypath) {
  if (typeof keypath === 'object') return keypath;

  if (typeof keypath === 'string') {
    var segments = keypath.split('|');
   
    return {
      keypath: segments.shift().trim(),
      formatters: segments.map(trim)
    };    
  }

  function trim (string) {
    if (typeof string === 'string') return string.trim();
  }
}

function getValue (el) {
  var value;

  if (/input|select/i.test(el.nodeName)) {
    if (el.type === 'checkbox') {
      return el.checked;
    }
    
    if (el.type === 'select-multiple') {
      value = [];

      for (var i = 0; i < el.options.length; i++) {
        if (el.options[i].selected) value.push(el.options[i].value);
      }

      return value;
    }
    
    return el.value;
  }

  return el.innerText;
}