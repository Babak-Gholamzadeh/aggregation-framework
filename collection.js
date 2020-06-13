const controller = require('./lib/controller');

function Collection(collection = []) {
  // TODO Check the collection type that it should be array
  this.collection = collection
}

const collectionMethods = {
  insertOne(doc) {
    this.collection.push(doc);
  },
  insertMany(docs) {
    this.collection.push(...docs);
  },
  aggregate(pipeline = []) {
    return controller(pipeline, this.collection);
  },
  count() {
    return this.collection.length;
  },
  deleteMany() {
    this.collection = [];
    return this.count();
  },

};

Object.assign(Collection.prototype, collectionMethods);


module.exports = Collection;
