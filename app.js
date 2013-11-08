var EventEmitter = require('eventemitter3');
var Empty = require('empty');
var Rabbit = require('./index');
var html = require('./template.html');

Empty.configure({ events: EventEmitter });

// html.cloneNode(true)

Rabbit.binders.color = {
  callback: function (el, value) {
    el.style.color = value.color;
  },
  values: ['color', 'title']
};

Rabbit.formatters.upcase = function upcase (value) {
  return value.toUpperCase();
};

Rabbit.formatters.add = function add (value, num) {
  return value + num;
};

Rabbit.formatters.array = {
  read: function (value, separator) {
    separator = separator || ', ';
    // console.log('array READ!', value);
    return value.join(separator);
  },
  publish: function (value, separator) {
    separator = separator || ',';
    // console.log('array PUBLISH', value);
    return value.split(separator).map(function (str) {
      if (typeof str === 'string') return str.trim();
    });
  }
};

// create model
var model = Empty.wrap({
  title: 'Yija',
  age: 32,
  link: 'fourty-five',
  url: 'http://google.com',
  tags: ['hola', 'perro', 'JO!'],
  color: 'lime'
});

var bindings = {
  '.title text': 'title | upcase',
  'a text': {
    keypath: 'link',
    formatters: []
  },
  'a href': 'url',
  'input value': 'tags | array'
};

// create view
var view = new Rabbit(html, model, bindings);

setTimeout(function () {
  model.set({
    title: 'hola don pepito',
    link: '8302.net',
    url: 'http://8302.net',
    color: 'blue'
  });
}, 600);

document.body.appendChild(view.el);

window.model = model;
window.view = view;