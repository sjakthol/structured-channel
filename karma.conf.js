module.exports = function (config) {
  config.set({
    basePath: '',
    browsers: ['Chrome'],
    frameworks: ['mocha', 'chai'],
    files: [
      'dist/structured-channel.js',
      { pattern: 'dist/structured-channel.js.map', included: false },
      { pattern: 'tests/helper_*', included: false },
      'tests/helper_functions.js',
      'tests/test_*.js'
    ],
  })
};
