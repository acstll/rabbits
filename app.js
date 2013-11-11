var EventEmitter = require('eventemitter3');
var Empty = require('empty');
var Rabbit = require('./index');
var html = require('./template.html');

Empty.configure({ events: EventEmitter });

// html.cloneNode(true)

Rabbit.binders.color = {
  oncreate: function (el) {
    this.polla = '8====D';
  },
  callback: function (el, value) {
    el.style.color = value.color;
    console.log(this.polla, value);
  },
  values: ['color', 'age']
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

// view 
function View (el, model, bindings) {
  this.el = el;
  this.model = model;
  this.rabbit = new Rabbit(this, model, bindings);
}

View.prototype.title = function () {
  console.log('title from View# called');
  return this.model.get('title') + ' JAJAJAJA';
};

// create model
var model = Empty.wrap({
  title: 'Yija',
  age: 32,
  link: 'fourty-five',
  url: 'http://google.com',
  tags: ['hola', 'perro', 'JO!'],
  color: 'lime',
  nice: true
});

var bindings = {
  '.title text': 'title',
  'a color': 'color',
  'a text': {
    keypath: 'link',
    formatters: []
  },
  'a href': 'url',
  'input value': 'tags | array',
  'input[name="nice"] checked': 'nice'
};

// create view
var view = new View(html, model, bindings);

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