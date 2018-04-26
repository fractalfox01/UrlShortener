'strict'

let express = require('express');
let app = express();
let query = express();
let http = require('http');
let https = require('https');
let mongo = require('mongodb').MongoClient;
//let mongoose = require('mongoose');


let url = "mongodb://localhost:27017/mydb";
let a = [];

setTimeout(function(){
  console.log(a.toString());
  //console.log("STRINGIFIED: " + JSON.stringify(a));
},3000);

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
    return 'Bad Address';
  }
}

function checkDB(){
  let links = {};
  mongo.connect(url, (err, db) => {
    if(err) throw (err);
    let dbo = db.db('mydb');
    dbo.collection('customers').find({},{address: 0}).toArray(function(err, result){
      if(err) throw (err);
      for(var i = 0; i < result.length; i++){
        //console.log(JSON.stringify(result[i].name) + ", " + JSON.stringify(result[i].address));
        links.url += result[i].name;
      }

      db.close();
    });
  });
  return links;
}

function renderer(req, res, lnk, qwry){
  a = [];
  mongo.connect(url, (err, db, cb) => {
    if(err) throw (err);
    let dbo = db.db('mydb');
    dbo.collection('customers').find({},{address: 0}).toArray(function(err, result){
      if(err) throw (err);
      for(var i = 0; i < result.length; i++){
        console.log(JSON.stringify(result[i].name) + ", " + JSON.stringify(result[i].address));
        a.push(result[i].name + ": " + result[i].address);
      }
      db.close();
    });
  });
  setTimeout(function(){
    console.log("inside app test *");
    console.log(lnk.toString());
    res.status(200).set({'content-type':'text/html'});
    res.render('pages/show', {a, qwry});
  },3000);

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
  //console.log("Before: " + JSON.stringify(responz));
  if(myquery == 'Bad Address'){
    myquery
  }
  renderer(req, res, a, myquery);
});

app.listen(port, () => {console.log("started server on port " + port);});