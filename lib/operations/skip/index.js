const { curry } = require('composable-utils');

const limit = curry((skipNumber, collection) => {
  console.log('skip Number:', skipNumber);
  return collection.slice(skipNumber);
});

module.exports = limit;
