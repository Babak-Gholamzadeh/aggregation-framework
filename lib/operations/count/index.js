const { curry } = require('composable-utils');

const count = curry((label, collection) => {
  console.log('label:', label);
  return {
    [label]: collection.length
  };
});

module.exports = count;
