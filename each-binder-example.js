// Extremely simple iteration exmaple.

module.exports = {
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
};