const match = _.curry((query, collection) => {
  // console.log('query:', query);
  // console.log('collection[0]:', collection[0]);
  return collection.filter(doc => {
    // A sample to proof the functionality works
    return doc.rating.average > 6.5
  });
});

module.exports = match;
