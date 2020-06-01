const { pipe, head } = require('composable-utils');
const match = require('./operations/match');
const project = require('./operations/project');
// const group = require('./operations/group');
// const sort = require('./operations/sort');
// const skip = require('./operations/skip');
// const limit = require('./operations/limit');

const createFunction = ([key, value]) => {
  const stageFunctions = {
    $match: match,
    $project: project,
    // $group: group,
    // $sort: sort,
  };
  return stageFunctions[key](value);
};

const compileStage = _.pipe(
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
