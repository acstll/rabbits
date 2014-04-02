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
  el.textContent = value || '';
};

exports.html = function (el, value) {
  el.innerHTML = value || '';
};

exports.href = function (el, value) {
  el.href = value || '';
};

exports.src = function (el, value) {
  el.src = value || '';
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

    el.value = value || '';
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
  el.disabled = !!value;
};

exports.disabled = function (el, value) {
  el.disabled = !value;
};

exports.checked = {
  event: 'change',
  callback: function (el, value) {
    if (el.type === 'radio') {
      el.checked = (el.value == value);
      return;
    }

    el.checked = !!value;
  }
};

exports.unchecked = {
  event: 'change',
  callback: function (el, value) {
    if (el.type === 'radio') {
      el.checked = !(el.value == value);
      return;
    }

    el.checked = !value;
  }
};
