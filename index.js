const controller = require('./lib/controller');

function Collection(data) {
  // TODO Check the data type that it should be array
  this.collection = data
}

const collectionMethods = {
  aggregate(pipeline) {
    return controller(pipeline, this.collection);
  },
};

Object.assign(Collection.prototype, collectionMethods);


module.exports = Collection;
