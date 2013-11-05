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

// show, hide, enabled, disabled
// checked, unchecked, value (input, select)