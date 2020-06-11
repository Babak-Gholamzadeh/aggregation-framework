const { curry } = require('composable-utils');

const limit = curry((limitNumber, collection) => {
  console.log('limit Number:', limitNumber);
  return collection.slice(0, limitNumber);
});

module.exports = limit;
