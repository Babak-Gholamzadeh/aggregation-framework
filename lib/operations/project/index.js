const project = _.curry((query, collection) => {
  // console.log('query:', query);
  // console.log('collection[0]:', collection[0]);
  return collection.map(doc => {
    // A sample to proof the functionality works
    return {
      name: doc.name,
      rate: doc.rating.average,
      net: doc.network ? doc.network.name : null
    }
  });
});

module.exports = project;
