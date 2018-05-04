const express = require('express');
const app = express();

const mongo = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/mydb';

const port = process.argv[2] || 3000;

//app.engine('ejs', require('ejs').renderFile);
//app.set('view engine', 'ejs');


//dbo.collection("urls").find({_id: 3}).toArray(function(err,result){
//  if(err) throw (err);
//  console.log(JSON.stringify(result));
//  db.close();
//  return JSON.stringify(result);
//});

//  EXAMPLE
//mongo.connect(url, (err, db) => {
//    if(err) throw (err);
//    let dbo = db.db('mydb');
//    dbo.collection('customers').find({},{address: 0}).toArray(function(err, result){
//      if(err) throw (err);
//      for(var i = 0; i < result.length; i++){
//        res.write("<p>" + JSON.stringify(result[i].name) + ", " + JSON.stringify(result[i].address) + "</p>");
//      }
//      res.end();
//      db.close();
//    });
//  });


//mongo.connect(url, (err, db) => {
//  if(err) throw (err);
//  let dbo = db.db('mydb');
//  dbo.collection("urls").find({_id: 3}).toArray(function(err,result){
//    if(err) throw (err);
//    console.log(JSON.stringify(result));
//    db.close();
//    return JSON.stringify(result);
//  });
//});
function display(req, res, next, ans){
  res.status(200).set({'content-type':'text/html'});
  res.write('<p>Working</p>');
  res.write("<h1>" + ans + "</h1>");
  res.end();
}

function getId(req, res, next, idToFind, cb){
  mongo.connect(url, (err, db) => {
    if(err) throw (err);
    let dbo = db.db('mydb');
    console.log('looking for: ' + idToFind);
    //console.log('looking for: ' + idToFind);
    dbo.collection("urls").find({_id: idToFind}, { url: 1 }).toArray(function(err, result){
      if(err) throw (err);
      console.log('result ' + JSON.stringify(result[0].url));
      db.close();
      cb(req, res, next, JSON.stringify(result[0].url));
    });
  });
}


app.get('/url/:id', (req, res, next) => {
  console.log("to string: " + req.params.id);
  getId(req, res, next, Number(req.params.id), display);
});

app.get('/', (req, res, next) => {
  console.log("catch-all triggered");
  res.status(200).set({'content-type':'text/html'});
  res.write("working");
  res.end();
});



app.listen(port);
console.log("server started");