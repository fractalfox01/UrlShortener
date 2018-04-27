//need db address population
// need add to db if not found.
// need make new link...

let express = require('express');

let app = express();
let query = express();
let http = require('http');
let https = require('https');
let mongo = require('mongodb').MongoClient;
//let mongoose = require('mongoose');

let globa;
let url = "mongodb://localhost:27017/mydb";

  // Creates new collection.
//mongo.connect(url, (err, db) => {
//  if(err) throw (err);
//  let dbo = db.db('mydb');
//  dbo.createCollection('urls', (err, ares) => {
//    if(err) throw (err);
//    console.log("urls Created");
//    db.close();
//  })
//});
  // Adds items into collection.
//mongo.connect(url, (err, db) => {
//  if(err) throw (err);
//  let dbo = db.db('mydb');
//  let myobj = [
//    { url: 'http://www.google.com'},
//    { url: 'http://www.coderealms.com'},
//    { url: 'http://www.spiraledthoughts.com'}
//  ];
////    let myobj = [
////    { name: 'Chocolate Hell', address: 'One Way 99'},
////    { name: 'Stinky Lemon', address: 'Ocean Blvd 2'},
////    { name: 'Vanilla Mare', address: 'Central st 954'}
////    ];
//  dbo.collection('urls').insertMany(myobj,(err, results) => {
//    if(err) throw (err);
//    console.log("Full Object Response: " + JSON.stringify(results));
//    db.close();
//  });
//});


function checkAddress(addr){
  //console.log('checking address...');
  let newAddress = JSON.stringify(addr).split('"');
  if(newAddress[3].includes('http') && !newAddress[3].includes('https')){
    if(newAddress[3].includes('www')){
      if(newAddress[3].includes('.com') || newAddress[3].includes('.net') || newAddress[3].includes('.org') || newAddress[3].includes('.io') ){
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

// retrieve all documents in collection.
function checkDB(){
  a = [];
  mongo.connect(url, (err, db, cb) => {
    if(err) throw (err);
    let dbo = db.db('mydb');
    dbo.collection('urls').find({},{_id: 0}).toArray(function(err, result){
      if(err) throw (err);
      console.log("Full DataBase: ");
      for(var el in result){
        console.log(result.url);
      }
      console.log("checkdb Result: " + JSON.stringify(result));
      for(var i = 0; i < result.length; i++){
        console.log(JSON.stringify(result[i].url));
        a.push(result[i].url);
      }
      db.close();
    });
  });
  return a;
}

function renderer(req, res, lnk, qwry){
  setTimeout(function(){
    console.log("rendering /show:url? response");
    console.log(lnk.toString());
    res.status(200).set({'content-type':'text/html'});
    res.render('pages/show', {lnk, qwry});
  },3000);

}

function putNewIn(newLink){
  setTimeout(function(){
    console.log("NEWLINK: " + newLink);
    mongo.connect(url, (err, db) => {
      if(err) throw (err);
      let dbo = db.db('mydb');
      let newIn = { url: newLink.toString() };
      dbo.collection('urls').insertOne(newIn, (err, results) => {
        if(err) throw (err);
        console.log(results);
        db.close();
      });
    });
  },2500);
}

const port = process.argv[2];
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  console.log("Entering index - " + JSON.stringify(req.connection.remoteAddress));
  res.status(200).set({'content-type':'text/html'});
  res.render('pages/index');
  console.log("Leaving index");
});

app.get('/show:url', (req, res) => {
  let myquery = checkAddress(req.query);
  //console.log("Before: " + JSON.stringify(responz));
  a = checkDB();
  let flag = true;
  setTimeout(function (){
    for(var j = 0; j < a.length; j++){
      if(myquery == a[j]){
        renderer(req, res, a, myquery);
        flag = false;
      }
      if(j == (a.length-1) && flag){
        putNewIn(myquery);
        res.status(200).set({'content-type':'text/html'});
        res.render('pages/insert');
        flag = true;
      }
    }
  },3000);

});

app.listen(port, () => {console.log("started server on port " + port);});