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

// create model
var model = Empty.wrap({
  title: 'Yija',
  link: 'fourty-five',
  url: 'http://google.com',
  color: 'lime'
});

var bindings = {
  'p text': 'title',
  'a text': 'link',
  'a href': 'url',
  'a color': 'color'
};

// create view
var view = new Rabbit(html, model, bindings);

setTimeout(function () {
  model.set({
    title: '8302',
    link: '8302.net',
    url: 'http://8302.net',
    color: 'blue'
  });
}, 600);

document.body.appendChild(view.el);

window.model = model;
window.view = view;