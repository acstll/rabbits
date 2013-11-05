exports.subscribe = function subscribe (obj, keypath, callback) {
  if (!obj.on) return;
  obj.on('change:' + keypath, callback);
};

exports.unsubscribe = function unsubscribe (obj, keypath, callback) {
  if (!obj.off) return;
  obj.off('change:' + keypath, callback);
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