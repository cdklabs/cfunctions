function wrap(output) {
  return async function (...args) {
    if (typeof(output) === 'function') {
      output = output(...args);
    }

    if (isPromise(output)) {
      output = await output;
    }

    return output;
  };
}

function isPromise(x) {
  return typeof(x) === 'object'
    && 'then' in x
    && 'catch' in x;
}

module.exports = { wrap };