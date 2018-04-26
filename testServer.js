let express = require('express');
let app = express();
let query = express();
let http = require('http');
let https = require('https');
let mongo = require('mongodb').MongoClient;

function checkAddress(addr){
  console.log('checking address...');
  let newAddress = JSON.stringify(addr).split('"');
  if(newAddress[3].includes('http') && !newAddress[3].includes('https')){
    if(newAddress[3].includes('www')){
      if(newAddress[3].includes('.com') || newAddress[3].includes('.net') || newAddress[3].includes('.org') ){
        return newAddress[3];
      }else{
        return 'Bad Address';
      }
    }else{
      return 'Bad Address';
    }
  }else{
    return newAddress[3];
  }
}

function renderer(req, res, qwry){
  console.log("inside app test *");
  console.log(qwry);
  res.status(200).set({'content-type':'text/html'});
  res.render('pages/show', {url: qwry});
}

const port = process.argv[2];
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  res.status(200).set({'content-type':'text/html'});
  res.render('pages/index');
});

app.get('/show:url', (req, res) => {
  let myquery = checkAddress(req.query);
  renderer(req, res, myquery);
});

app.listen(port, () => {console.log("started server on port " + port);});