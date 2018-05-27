require('dotenv').config();

const express = require('express');
const app = express();

const mongo = require('mongodb');

const port = 3000;
// .env used for testing purposes only.
const url = process.env.URL;
const zeno = process.env.ZENO;

function viewAll(){
  //Displays all records found in collection 'links'.
  mongo.connect(url, function(err, db){
    if(err) return (err);
    if(db){
      console.log("Connected successfully To DB:", "'" + db['s']['options']['dbName'] + "'");
      let dbo = db.db('url-shortener');
      dbo.collection('links').find({}).toArray((err, resp) => {
        if(err) console.log(err.stack);
        if(resp){
          console.log("Viewed");
          console.log(resp);
          db.close();
          return (resp);
        }
      });
    }
  });
}
function verifyAddr(address){
  // Verifies URL. checks for http, https, www, com, org, net.
  // Takes a String as input.
  // Returns True for a Valid address. False for invalid.
  if(address.includes('http://') || address.includes('https://')){
    console.log('http found');
    if( address.includes('.com') || address.includes('.org') || address.includes('.net') || address.includes('.gov')){
      console.log('www with domain found');
      return true;
    }
  }
  else{
    console.log('Bad Address');
    return false;
  }
}

function queryNum(req, res){
  // Queries for the pass number.
  // Example. A GET request like " localhost:3000/?3 " returns the url associated with _id 3.
  // A failed request returns "Bad Address".
  // A request for 1337.1337, returns full db.
  mongo.connect(url)
    .then(function(db){
      let temp = Object.keys(req.query);
      let fetch = Number(temp[0]);
      if(fetch == zeno){
        // Lists entire collection
        let dbo = db.db('url-shortener');
        dbo.collection('links').find({}).toArray()
        .then(function(resp){
          res.status(200).set({'content-type':'text/html'});
          for(var i = 0; i < resp.length; i++){
            let tmp = "https://lml.glitch.me/?" + i;
            res.write("<h1 style='margin-left:10vw;background-color:#cca;color:red;text-align:center;width:50px;'>" + i + ". </h1><h5 style='padding:5px 0px 5px 40px;background-color:#000;width:50vw;color:#ccf;margin-left:20vw;'>Redirects to <span style='color:#0d0;padding-left:5px;'>" + JSON.stringify(resp[i].url) + "</span></h1>");
            res.write("<p style='margin-left:23vw;'>Shortened URL: <a style='padding-left:10px;' target='_blank' href='" + tmp + "'>" + tmp + "</a></p>");
            res.write("<hr style='width:80vw;height:3px;background-color:blue;'/>");
          }
          res.end();
        })
        .catch(function(err){
          console.log(err.stack);
          res.status(200).set({'content-type':'text/html'});
          res.write("<h1>Error2</h1>");
          res.end();
        })
      }else if(fetch){
        let dbo = db.db('url-shortener');
        dbo.collection('links').find({_id: fetch}).toArray()
          .then(function(resp){
            res.status(200).set({'content-type':'text/html'});
            res.write("<h1>" + JSON.stringify(resp[0].url) + "</h1>");
            res.write("<script>");
            res.write("console.log('working');");
            res.write("window.location =" +
            JSON.stringify(resp[0].url) + ";");
            res.write("</script>")
            res.end();
          })
          .catch(function(err){
            console.log(err.stack);
            res.status(200).set({'content-type':'text/html'});
            res.write("<h1>Server Error 3 - Undefined Request Made.</h1>");
            res.write('<pre style="background-color:#555;color:#ccf;width:600px;padding:10px">' + err.stack + "</pre>");
            res.end();
          })
      }else{
        let dbo = db.db('url-shortener');
        dbo.collection('links').find({}).toArray()

          .then(function(resp){
            res.status(200).set({'content-type':'text/html'});
            res.write('<div style="margin-left:50px;width:100vw;height:2em;"><h1 style="color:blue;">Basic Usage:</h1></div>');
            res.write('<ul>');
            res.write('<li><h2>The URL <span style="color:#0ea;">https://lml.glitch.me</span> displays This page.</h2></li>');
            res.write('<li><h2>The URL <span style="color:#0ea">https://lml.glitch.me/url/</span> Creates a new shortened link: <span style="color:#0e0;">Example.</span> <label style="color:#d00;" href="https://lml.glitch.me/url/?url='+'"https://www.freecodecamp.org/"'+'">https://lml.glitch.me/url/?url="https://www.freecodecamp.org/"</label> , Redirects to a JSON page with the new shortened URL link listed.</h2></li>');
            res.write('<li><h2>If the URL inserted at https://lml.glitch.me/url/ is a new address to the database, the URL is assigned the next id in line and a JSON response is written to the screen.</h2></li>');
            res.write('<li><h2>Visit the URL https://lml.glitch.me/?1337.1337 to view the full database.</h2></li>');
            res.write('</ul>');
            res.end();

          })
          .catch(function(err){
            console.log(err.stack);
          })
      }
    })
    .catch(function(err){
      console.log(err.stack);
    });
}

function newlookup(req, res){
  let lookup = req.query.url;
  console.log("unedited ",lookup);
  lookup = lookup.substring(1, lookup.length-1);
  console.log("after edited ",lookup);
  if(verifyAddr(lookup)){
    // address is valid.
    mongo.connect(url)
      .then(function(db){
        let dbo = db.db('url-shortener');
        dbo.collection('links').find({}).toArray()
          .then(function(resp){
            let len = resp.length
            for(var i = 0; i < len; i++){
              // Iterate though db.
              console.log(resp[i]);
              if(lookup == resp[i].url){
                // lookup was found, end's the for loop.
                res.status(200).set({'content-type':'application/json'});
                res.json({
                  'Link Found': resp[i].url,
                  'ID': resp[i]._id,
                  'Your Shortened Link': 'https://lml.glitch.me/?' + resp[i]._id,
                })
                res.end();
                db.close();
                break;
              }
              if(i == len-1){
                let myObj = {
                  _id: (len+1),
                  url: lookup
                };
                dbo.collection('links').insertOne(myObj)
                  .then(function(resp){
                    res.status(200).set({'content-type':'application/json'});
                    res.json({
                      'New Redirect URL': 'http://lml.glitch.me/?' + (len+1),
                      'redirecting to ': lookup
                    });
                    res.end();
                    db.close();
                  })
                  .catch(function(err){console.log(err.stack);})
              }
            }

          })
          .catch(function(err){
            console.log(err.stack);
          })
      })
      .catch(function(err){
        console.log(err.stack);
      })
  }else{
    // address not valid.
    res.status(200).set({'content-type':'application/json'});
    res.json({'Invalid Address' : lookup});
    res.end();
  }
}

app.get('/url', function(req, res, next){
  newlookup(req, res);
});

app.get("/*", function(req, res, next){
  queryNum(req, res);
  next();
});

app.get('*', function(req, res){
  console.log("server url ",req.originalUrl);
  
  console.log("Querying for ",req.query);
});

app.listen(port, () => {
  console.log("Server started on port ", port);
})