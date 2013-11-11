module.exports = options;

function options (target, source) {
  target = target || {};
  source = source || {};
  var keys = Object.keys(source) || [];

  if (Array.isArray(source) || keys.length === 0) {
    target = source;
    return target;
  }

  keys.forEach(function (key) {
    if (target[key] && typeof source[key] === 'object')
      return target[key] = options(target[key], source[key]);

    target[key] = source[key];
  });

  return target;
}