const {
  compose, pipe, curry, Either, Left, Right, fold2, map, chain
} = require('composable-utils');
const realTypeOf = require('realtypeof');

const get = curry((path, obj) =>
  (function getR(obj, [firstKey, ...restKeys]) {
    return obj.hasOwnProperty(firstKey) ?
      (restKeys.length ?
        getR(obj[firstKey], restKeys) :
        obj[firstKey]) :
      undefined;
  })(obj, path.replace(/\]/g, '').replace(/\[/g, '.').split('.')));

const operator = {
  $and: curry((v1, v2) => {
    return pipe(
      Either,
      ...v1.map(q => {
        return pipe(
          ...Object.entries(q).map(funcFromProperty),
        );
      })
    )(v2);
  }),
  $or: curry((v1, v2) => {
    return pipe(
      Either,
      ...v1.map(q => {
        return chain(
          pipe(
            Either,
            ...Object.entries(q).map(funcFromProperty),
            fold2(Right, Left)
          )
        );
      }),
      fold2(Right, Left)
    )(v2);
  }),
  $not: curry((v1, v2) => {
    // console.log('v1:', v1, 'v2:', v2);
    return pipe(
      Either,
      ...Object.entries(v1).map(funcFromProperty),
      fold2(
        x => {
          // console.log('Left2Right:', x);
          return Right(x);
        },
        x => {
          // console.log('Right2Left:', x);
          return Left(x);
        })
    )(v2);
  }),
  $eq: curry((v1, v2) => JSON.stringify(v2) === JSON.stringify(v1) ? Right(v2) : Left(v2)),
  $ne: curry((v1, v2) => JSON.stringify(v2) !== JSON.stringify(v1) ? Right(v2) : Left(v2)),
  $gt: curry((v1, v2) => v2 > v1 ? Right(v2) : Left(v2)),
  $gte: curry((v1, v2) => v2 >= v1 ? Right(v2) : Left(v2)),
  $lt: curry((v1, v2) => v2 < v1 ? Right(v2) : Left(v2)),
  $lte: curry((v1, v2) => v2 <= v1 ? Right(v2) : Left(v2)),
  $in: curry((v1, v2) => v1.includes(v2) ? Right(v2) : Left(v2)),
  $nin: curry((v1, v2) => !v1.includes(v2) ? Right(v2) : Left(v2)),
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
      return pipe(
        Either,
        funcFromProperty(['$eq', v1]),
      )(v2);
    };
  } else {
    return v2 => {
      return pipe(
        Either,
        ...Object.entries(v1).map(funcFromProperty),
      )(v2);
    };
  }
};

const assertTo = curry((doc, assertion, v) => {
  return pipe(
    assertion,
    fold2(x => Left(doc), x => Right(doc))
  )(v);
});

const parseProp = curry(([key, value], doc) => {
  const output = pipe(get(key), assertTo(doc, assertion(value)))(doc);
  return output;
});

const funcFromProperty = ([key, value]) => {
  if (key in operator) {
    return chain(operator[key](value));
  } else {
    return chain(parseProp([key, value]));
  }
};

const filterQuery = query => {
  const filterPipe = pipe(
    Either,
    ...Object.entries(query).map(funcFromProperty),
  );
  return filterPipe;
};

const match = curry((query, collection) => {
  const checkDoc = compose(fold2(
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
