// need db address population - done
// need add to db if not found. - done
// need make new link... - done, id
// need query db on link redirect. stored as { id: <number>, url: 'http<s>://www.<some address>.<com>' }

// resolve the function mess i have going on ie. use/learn some promises and async.

let express = require('express');

let app = express();

//let http = require('http');
//let https = require('https');
let mongo = require('mongodb').MongoClient;
//let mongoose = require('mongoose');

let globa;
let url = "mongodb://localhost:27017/mydb";

  // Delete a Collection(Table). delets 'customers' collection.
//mongo.connect(url, (err,db) => {
//  if(err) throw (err);
//  let dbo = db.db('mydb');
//  dbo.collection('urls').drop(function(err, delOK){
//    if(err) throw (err);
//    if(delOK) console.log("Collection Deleted");
//    db.close();
//  });
//  // OR
////dbo.dropCollection("customers", function(err, delOK){
////  if(err) throw (err);
////  if(delOK) res.write("Collection Deleted");
////  res.end();
////  db.close();
////});
//});

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
////   Adds items into collection.
//mongo.connect(url, (err, db) => {
//  if(err) throw (err);
//  let dbo = db.db('mydb');
//  let myobj = [
//    { _id: 1, url: 'http://www.google.com'},
//    { _id: 2, url: 'http://www.coderealms.com'}
////    { url: 'http://www.spiraledthoughts.com'}
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

//-----------------------------------------------------
//=====================================================

const port = process.argv[2];
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

//==================================================================
//        functions for the '/url/:id' route.
//==================================================================
function display(req, res, next, ans){
  res.status(200).set({'content-type':'text/html'});
  res.render('pages/url', { ans });
}

function getUrlFromId(req, res, next, idToFind, cb){
  mongo.connect(url, (err, db) => {
    if(err) throw (err);
    let dbo = db.db('mydb');
    console.log('looking for: ' + idToFind);
    //console.log('looking for: ' + idToFind);
    dbo.collection("urls").find({_id: idToFind}).toArray(function(err, result){
      if(err) throw (err);
      console.log('result ' + JSON.stringify(result[0].url));
      db.close();
      cb(req, res, next, result[0].url);
    });
  });
}

app.get('/url/:id', (req, res, next) => {
  // fetches the corresponding id's url from the database.
  let num = req.params.id;
  console.log("to string: " + req.params.id);
  if(Number(num) != NaN){
    getUrlFromId(req, res, next, Number(req.params.id), display);
  }else{
    res.status(200).set({'content-type':'text/html'});
    res.render('pages/url', { num });
  }
});

//=================================================================
//        functions for the '/retrieve' route.
//==================================================================
function getIdFromUrl(req, res, next, urlToFind, cb){
  mongo.connect(url, (err, db) => {
    if(err) throw (err);
    let dbo = db.db('mydb');
    console.log('looking for: ' + urlToFind);
    //console.log('looking for: ' + idToFind);
    if(urlToFind != NaN){
      console.log("this is a number: " + urlToFind);
      dbo.collection("urls").find({url: urlToFind}).toArray(function(err, result){
        if(err) throw (err);
        console.log('result ' + JSON.stringify(result[0]._id));
        db.close();
        if(JSON.stringify(result[0]._id) == 'undefined'){
          cb(req, res, next, 'Bad Address');
        }else{
          cb(req, res, next, result[0]._id);
        }
      });
    }else{
      console.log("this is NOT a number: " + urlToFind);
      cb(req, res, next, 'Bad Address');
    }

  });
}

function showInsert(req, res, next, dd){
  console.log('Retrieve page');
  res.status(200).set({'content-type':'text/html'});
  res.render('pages/retrieve', { dd });
}

app.get('/retrieve', (req, res, next) => {
  let dd = req.query['url'];
  console.log("dd is " + dd.toString());
  dd = 'Bad Address';
  res.status(200).set({'content-type':'text/html'});
  res.render('pages/retrieve', { dd });
});

//=================================================================
//        functions for the '/check' route.
//==================================================================
function execute(req, res, sendBack){
  console.log("SendBack is: " + sendBack);
  res.render('pages/check');
  return true;
}
async function checkAndSend(req, res){
  let sendBack = [];
  let response;
  try{
    response = await mongo.connect(url, (err, db) => {
      if(err) throw err
      let dbo = db.db('mydb');
      dbo.collection('urls').find({}).toArray(function(err, result){
        if(err) throw (err);
        for(var i = 0; i < result.length; i++){
          console.log("result --> " + JSON.stringify(result[i]));
          if(req.query['url'] == (result[i]['url']).toString()){
            sendBack.push(result[0]['url']);
            execute(req, res, sendBack);
            db.close();
            console.log('found');
          }
        }
        if(sendBack.length == 0){
          // req.query['url'] needs to be added to database here (before render).
          execute(req, res, 'Not Found');
          db.close();
        }
      });
    })
  }catch (err){
    console.log(err);
  };
}

function checkAddress(addr){
  //console.log('checking address...');
//  let newAddress = JSON.stringify(addr).split('"');
  if(addr.includes('http') || addr.includes('https')){
    if(addr.includes('www')){
      if(addr.includes('.com') || addr.includes('.net') || addr.includes('.org') || addr.includes('.io') ){
        return addr;
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

app.get('/check', (req, res, next) => {
  console.log('Referal from: ' + req.headers.referer);
  console.log(req.query['url']);
  res.status(200).set({'content-type':'text/html'});
  //res.render('pages/check');
  checkAndSend(req, res);
});

app.get('/', (req, res) => {
  console.log("Entering index - " + JSON.stringify(req.connection.remoteAddress));
  res.status(200).set({'content-type':'text/html'});
  res.render('pages/index');
  console.log("Leaving index");
});

app.listen(port, () => {console.log("started server on port " + port);});