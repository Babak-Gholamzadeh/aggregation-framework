const {
  compose, pipe, curry, Maybe, fold, map, chain
} = require('composable-utils');

const get = curry((path, obj) =>
  (function getR(obj, [firstKey, ...restKeys]) {
    return obj.hasOwnProperty(firstKey) ?
      (restKeys.length ?
        getR(obj[firstKey], restKeys) :
        obj[firstKey]) :
      undefined;
  })(obj, path.replace(/\]/g, '').replace(/\[/g, '.').split('.')));

const log = curry((a, b) => {
  console.log(a, b);
  return b;
});

const deepAssign = curry((a, b) => Object.assign(a, b));

const parseProp = curry(([key, value], { doc, newDoc }) => {
  console.log(`[${key}, ${value}]:`, [key, value]);
  const docPropValue = get(key, doc);
  console.log('docPropValue:', docPropValue);
  if (docPropValue === undefined) {
    return compose(newDoc => ({ doc, newDoc }), log('1:'), deepAssign(newDoc), () => ({ [key]: value }))();
  } else {
    if (value) {
      return compose(newDoc => ({ doc, newDoc }), log('2:'), deepAssign(newDoc), () => ({ [key]: docPropValue }))();
    } else {
      return compose(newDoc => ({ doc, newDoc }), log('2:'), deepAssign(newDoc), () => ({}))();
    }
  }
});

const funcFromProperty = ([key, value]) => {
  return map(parseProp([key, value]));
};

const mapQuery = query => {
  const mapPipe = pipe(
    Maybe,
    ...Object.entries(query).map(funcFromProperty),
  );
  return mapPipe;
};

const project = curry((query, collection) => {
  console.log('query:', query);
  const mapQueryFunc = compose(fold(r => r.newDoc), mapQuery(query));

  return collection.map(doc => {
    const result = mapQueryFunc({ doc, newDoc: {} });
    console.log('docResult:', result);
    return result;
    // A sample to proof the functionality works
    // return {
    //   name: doc.name,
    //   rate: doc.rating.average,
    //   net: doc.network ? doc.network.name : null
    // }
  });
});

module.exports = project;
