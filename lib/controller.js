const { pipe, head } = require('composable-utils');
const match = require('./operations/match');
const project = require('./operations/project');
const count = require('./operations/count');
// const group = require('./operations/group');
// const skip = require('./operations/skip');
// const limit = require('./operations/limit');


// key is the stage function name
// value is the query for that stage
const createFunction = ([key, value]) => {
  const stageFunctions = {
    $match: match,
    $project: project,
    $count: count,
    // $group: group,
    // $sort: sort,
  };
  return stageFunctions[key](value);
};

const compileStage = pipe(
  Object.entries,     // i.g. [[ $match, { status: 'Ended' } ]]
  head,               // i.g. [ $match, { status: 'Ended' } ]
  createFunction      // i.g. function $match() {}
);

const controller = (pipeline, collection) =>
  pipe(
    // Loop through the stages of pipleline
    // and create the coresponding function of them
    // then pipe the collection through them
    ...pipeline.map(compileStage)
  )(collection);

module.exports = controller;
