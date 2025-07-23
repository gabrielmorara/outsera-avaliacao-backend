const { start } = require('./src/start');

if (require.main === module) {
  start();
}

module.exports = { start };
