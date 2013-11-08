exports.subscribe = function subscribe (obj, options, callback) {
  if (!obj.on) return;
  var event = options.event ? options.event : 'change:' + options.keypath;
  obj.on(event, callback);
};

exports.unsubscribe = function unsubscribe (obj, options, callback) {
  if (!obj.off) return;
  var event = options.event ? options.event : 'change:' + options.keypath;
  obj.off(event, callback);
};

exports.get = function get (obj, keypath) {
  if (typeof obj[keypath] === 'function') {
    return obj[keypath]();
  } else if (typeof obj.get === 'function') {
    return obj.get(keypath);
  } else {
    return obj[keypath];
  }
};

exports.set = function set (obj, keypath, value) {
  if (typeof obj[keypath] === 'function') {
    return obj[keypath](value);
  } else if (typeof obj.get === 'function') {
    obj.set(keypath, value);
  } else {
    obj[keypath] = value;
  }
};