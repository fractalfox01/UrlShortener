const express = require('express');
const app = express();
const path = require('path');
const http = require('http');
const https = require('https');
const delay = require('express-delay');
const mongo = require("mongodb").MongoClient;
//app.use('/url/',express.static('/url/'));
//app.use(delay(1000));
let f = false;

function parseURL(arg){
  console.log("First");
  let final = '';
  const regWWW = /\^www/;
  let linktest1 = false;
  let linktest2 = false;
  let test = arg.split('/');
  for(var i = 0; i < test.length; i++){
    if(test[i] == 'http:' || test[i] == 'https:'){
      linktest1 = true;
      final += test[i];
    }
    if(test[i].includes('www') && linktest1){
      let aa = test[i].split('.');
      if(aa[0] == 'www'){
        if(aa[2] == 'com' || aa[2] == 'org' || aa[2] == 'net'){
          final += "//" + test[i];
        }else{
          final = "not a url";
        }
      }
    }
  }
  if(final == 'http:' || final == 'https:'){
    final = 'not a url';
  }
  return final;
}

function checkAddress(report){
  let flag = false;
  // Function handles http and https GET requests to the desired url
  // function needs to handle a request limit per an arbitrary amount of time. prevent DOS/DDOS
  console.log("Second");
  let len = report.length;
  let parsed = '';
  //strips (http://) from ex. http://www.coderealms.com
  console.log(report);
  if(report.includes('https')){
    parsed = report.substring(8, len);
    https.get({hostname: parsed}, (resp) => {
      let rawData = '';

      if(resp.statusCode == 200){
        flag = true;
      }
      resp.on('data', (chunk) => { rawData += chunk;});

      resp.on('end', () => {
        console.log("verify closed");
        console.log(flag);
        f = flag;
      });
    });
  }else{
    parsed = report.substring(7, len);
    http.get({hostname: parsed}, (resp) => {
      let rawData = '';

      if(resp.statusCode == 200){
        flag = true;
      }
      resp.on('data', (chunk) => { rawData += chunk;f = flag;});

      resp.on('end', () => {
        console.log("verify closed");
        console.log(flag);

      });
    });
  }
  console.log(parsed);
}

function test(res, report){
  setTimeout(function(){
    console.log("Third");
    if(f){
      res.json({'address': report, 'res_status': f});

      res.end();
    }else{
      res.json({'address': report, 'res_status': f});

      res.end();
    }
  },300);
}

app.all('/url/*', (req, res) => {
  console.log("/url/* Accessed @ - " + new Date());
  console.log("Queried: " + req.originalUrl + "; From: " + req.headers['x-forwarded-for']);
  let report = parseURL(req.originalUrl);
  console.log("Report is " + report);
  if(report == ''){
    res.status(200);
    res.set({'content-type':'application/json'});
    res.json({report: 'not accepted'});
    res.end();
  }else{
    if(report != 'not a url'){
      checkAddress(report);
    }
    // test function: handles this servers response (based on f variable).
    test(res, report);
  }
  f = false;

});


app.all('*', (req, res) => {
  console.log("index working");

  res.status(200);
  res.set({'content-type':'text/html'});

  res.write("<h1>Working</h1>");
  res.end();
});

const listener = app.listen(3000, () => {
  console.log("Starting Server On port " + listener.address().port);
  console.log('@ - ' + new Date());
  console.log('');
});