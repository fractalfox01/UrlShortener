let express = require('express');
let app = express();
let http = require('http');
let https = require('https');
let mongo = require('mongodb').MongoClient;

const port = process.argv[2];
app.set('view engine', 'ejs');

app.get('/test:data', (req, res) => {
  res.status(200).set({'content-type':'text/html'});

});
app.get('/', (req, res) => {
  res.status(200).set({'content-type':'text/html'});
  res.render('pages/index');
});

app.listen(port, () => {console.log("started server on port " + port);});