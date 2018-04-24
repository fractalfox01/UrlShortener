// ***********88Preserve for records************

const mongo = require('mongodb').MongoClient;

let port = 27017;
url = "mongodb://localhost:27017/urlshortener";

//mongo.connect(url, (err, db) => {
//  if(err) throw (err);
//  console.log("Database urlshortener Created");
//  db.close();
//});
//mongo.connect(url, (err, db) => {
//  if(err) throw (err);
//  let dbo = db.db('urlshortener');
//  dbo.createCollection('links', (err, db) => {
//  if(err) throw (err);
//    console.log("Collection Links Created");
//    db.close();
//  });
//});
//mongo.connect(url, (err, db) => {
//  if(err) throw (err);
//  let myObj = {
//    _id: {link2:'https://www.yahoo.com'}
//  };
//  let dbo = db.db('urlshortener');
//  dbo.collection('links').insertOne(myObj, (err, res) => {
//    if(err) throw (err);
//    console.log("1 Document has been inserted.");
//    db.close();
//  });});
  mongo.connect(url, (err, db) => {
    if(err) throw (err);
    let dbo = db.db('urlshortener');
    dbo.collection('links').find({},{_id: 0}).toArray(function(err, result){
      if(err) throw (err);
      for(var i = 0; i < result.length; i++){
        console.log(result[i]);
      }
      db.close();
    });
});
//  mongo.connect(url, (err,db) => {
//    if(err) throw (err);
//    let dbo = db.db("urlshortener");
//    let deleteMe = {link1: 'https://www.google.com'};
//    dbo.collection('links').deleteOne(deleteMe, function(err, obj){
//      if(err) throw (err);
//      console.log(JSON.stringify(obj));
//      db.close();
//    });
//  });

