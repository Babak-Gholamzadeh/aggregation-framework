const realTypeOf = require('realtypeof');

const get = _.curry((path, obj) =>
  (function getR(obj, [firstKey, ...restKeys]) {
    return obj.hasOwnProperty(firstKey) ?
      (restKeys.length ?
        getR(obj[firstKey], restKeys) :
        obj[firstKey]) :
      undefined;
  })(obj, path.replace(/\]/g, '').replace(/\[/g, '.').split('.')));

const operator = {
  // $and: () => {},
  $eq: _.curry((v1, v2) => JSON.stringify(v2) === JSON.stringify(v1) ? _.Right(v2) : _.Left(v2)),
  $ne: _.curry((v1, v2) => JSON.stringify(v2) !== JSON.stringify(v1) ? _.Right(v2) : _.Left(v2)),
  $gt: _.curry((v1, v2) => v2 > v1 ? _.Right(v2) : _.Left(v2)),
  $lt: _.curry((v1, v2) => v2 < v1 ? _.Right(v2) : _.Left(v2)),
};

const isNormalObject = v => {
  const result = Object.keys(v).filter(key => !Object.keys(operator).includes(key));
  return !!result.length
}

const assertion = v1 => {
  if (
    (realTypeOf.isObject(v1) && isNormalObject(v1)) ||
    !realTypeOf.isObject(v1)
  ) {
    return v2 => {
      return _.pipe(
        _.Either,
        funcFromProperty(['$eq', v1]),
      )(v2);
    };
  } else {
    return v2 => {
      return _.pipe(
        _.Either,
        ...Object.entries(v1).map(funcFromProperty),
      )(v2);
    };
  }
};

const assertTo = _.curry((doc, assertion, v) => {
  return _.pipe(
    assertion,
    _.fold2(x => _.Left(doc), x => _.Right(doc))
  )(v);
});

const parseProp = _.curry(([key, value], doc) => {
  const output = _.pipe(get(key), assertTo(doc, assertion(value)))(doc);
  return output;
});

const funcFromProperty = ([key, value]) => {
  if (key in operator) {
    return _.chain(operator[key](value));
  } else {
    return _.chain(parseProp([key, value]));
  }
};

const filterQuery = query => {
  const filterPipe = _.pipe(
    _.Either,
    ...Object.entries(query).map(funcFromProperty),
  );
  return filterPipe;
};

const match = _.curry((query, collection) => {
  const checkDoc = _.compose(_.fold2(
    x => {
      // console.log('NO', '\n');
      return false;
    },
    x => {
      // console.log('YES', '\n');
      return true;
    }), filterQuery(query));
  return collection.filter(checkDoc);
});

module.exports = match;
