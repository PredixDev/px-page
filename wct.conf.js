module.exports = {
  verbose: false,
  plugins: {
    local: {
      browsers: ['chrome', 'firefox']
    },
    sauce: {
      disabled: true
    }
  },
  suites: [
    'test/px-page-test-fixture.html'
  ]
};