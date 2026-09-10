// Node's unit-test runner has no CSS bundler. Pages imported for their metadata
// may reference CSS modules; visual CSS behavior is verified in browser QA.
require.extensions['.css'] = function loadStyles(module) {
  module.exports = new Proxy({}, { get: (_target, name) => name === '__esModule' ? false : String(name) });
};
