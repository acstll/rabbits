var EventEmitter = require('eventemitter3');
var Empty = require('empty');
var Rabbit = require('../index');
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

Rabbit.binders.each = {
  oncreate: function (el) {
    var template = el.cloneNode(true);
    this.children = [];

    this.template = function () {
      return template.cloneNode(true);
    };
    this.container = el.parentNode;
    el.parentNode.removeChild(el);
  },
  callback: function (el, values) {
    var bindings = this.rabbit.config.bindings;
    this.container.innerHTML = '';

    values.origin.forEach(function (value) {
      var item = this.template();
      var rabbit = new Rabbit(item, value, bindings);
      this.container.appendChild(rabbit.el);
      this.children.push(rabbit);
    }, this);
  },
  onremove: function (el) {
    this.children.forEach(function (rabbit) {
      rabbit.remove();
    });
  }
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

var options = {
  things: ['haha', 1, 2],
  formatters: {
    locase: function (value) {
      return value.toLowerCase();
    }
  },
  // for eech
  bindings: {
    'span': 'title',
    'a': 'link',
    'a href': 'href',
  }
};

var links = Empty.wrap([]);

links.push(Empty.wrap({
  title: 'JAJAJA',
  link: 'jajaja.net',
  href: 'http://jajaja.net'
}));

links.push(Empty.wrap({
  title: 'HIHIHI',
  link: 'hihihi.net',
  href: 'http://hihihi.net'
}));

links.push(Empty.wrap({
  title: 'YAY',
  link: 'yay.net',
  href: 'http://yay.net'
}));

window.links = links;

// view 
function View (el, model, bindings) {
  this.el = el;
  this.model = model;
  this.rabbit = new Rabbit(this, model, bindings, options);
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
  nice: true,
  links: links
});

var bindings = {
  '.title text': 'title',
  'a color': 'color',
  'a text': {
    keypath: 'link',
    formatters: ['locase']
  },
  'a href': 'url',
  'input value': 'tags | array',
  'input[name="nice"] checked': 'nice',
  'li each': {
    keypath: 'links'
  }
};

// create view
var view = new View(html, model, bindings);

// setTimeout(function () {
//   model.set({
//     title: 'hola don pepito',
//     link: '8302.net',
//     url: 'http://8302.net',
//     color: 'blue'
//   });

//   view.rabbit.render();
// }, 600);

document.body.appendChild(view.el);

window.model = model;
window.view = view;
window.Rabbit = Rabbit;
window.Empty = Empty;