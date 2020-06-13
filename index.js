const express = require('express');
const bodyParser = require('body-parser');
const Collection = require('./collection');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const collection = new Collection();

app.post('/insert/one', (req, res) => {
  console.log('doc:', req.body.doc);
  if (req.body.doc) {
    collection.insertOne(req.body.doc);
    res.send('one doc inserted!');
  } else {
    res.send('there is no doc');
  }
});

app.post('/insert/many', (req, res) => {
  console.log('docs:', req.body.docs);
  if (req.body.docs) {
    collection.insertMany(req.body.docs);
    res.json({ msg: 'many docs inserted!', length: collection.count() });
  } else {
    res.send('there is no doc');
  }
});

app.post('/aggregate', (req, res) => {
  console.log('aggregate:', req.body.aggregate);
  const result = collection.aggregate(req.body.aggregate);
  console.log('result:', result);
  res.json({ length: result.length, data: result });
});

app.get('/delete/many', (req, res) => {
  res.json({ msg: 'all docs deleted!', length: collection.deleteMany() });
});

app.get('/test', (req, res) => {
  res.send('Hello there!');
});

app.listen(2717, () => console.log('memgoDB is running...'));
