// A binder can be a 'callback'
// or an object with the following properties:
//
// .callback: function (el, value) {}
// .oncreate: function (el) {}
// .onremove: function (el) {}
// .event: String
//   setting this makes the binding listen for that DOM event on el
//   and publishes changes back to the model
// .values: Array
//   extra values to read from the model and pass to callback as dict



exports.text = function (el, value) {
  el.innerText = value;
};

exports.html = function (el, value) {
  el.innerHTML = value;
};

exports.href = function (el, value) {
  el.href = value;
};

exports.value = {
  event: 'change',
  callback: function (el, value) {
    if (el.type === 'select-multiple') {
      for (var i = 0; i < el.options.length; i++) {
        if (value.indexOf(el.options[i].value) > -1)
          el.options[i].selected = 'selected';
      }
      return;
    }

    el.value = value;
  }
};

exports.show = {
  oncreate: function (el) {
    this.initialValue = el.style.display;
  },
  callback: function (el, value) {
    if (value) {
      el.style.display = this.initialValue;
    } else {
      el.style.display = 'none';
    }
  }
};

exports.hide = {
  oncreate: function (el) {
    this.initialValue = el.style.display;
  },
  callback: function (el, value) {
    if (value) {
      el.style.display = 'none';
    } else {
      el.style.display = this.initialValue;
    }
  }
};

exports.enabled = function (el, value) {
  if (value) {
    el.disabled = false;
  } else {
    el.disabled = 'disabled';
  }
};

exports.disabled = function (el, value) {
  if (value) {
    el.disabled = 'disabled';
  } else {
    el.disabled = false;
  }
};

exports.checked = {
  event: 'change',
  callback: function (el, value) {
    if (value) {
      el.checked = 'checked';
    } else {
      el.checked = false;
    }
  }
};

exports.unchecked = {
  event: 'change',
  callback: function (el, value) {
    if (value) {
      el.checked = false;
    } else {
      el.checked = 'checked';
    }
  }
};

exports.each = {
  oncreate: function (el) {
    var template = el.cloneNode(true);

    this.template = function () {
      return template.cloneNode(true);
    };
    this.container = el.parentNode;
    el.parentNode.removeChild(el);
  },
  callback: function (el, values) {
    this.container.innerHTML = '';

    values.forEach(function (value) {
      var item = this.template();
      item.innerText = value;
      this.container.appendChild(item);
    }, this);
  }
}