'use strict';

const http = require('http');

const app = new http.Server();
const port = 3000;

app.on('request', (req, res) => {
  // eslint-disable-next-line no-console
  console.log('got request');
  res.end('Hello Fargate!');
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on port ${port}.`);
});
