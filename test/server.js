var express = require('express');
var readFile = require('fs').readFile;
var browserify = require('browserify');
var trdomify = require('./tr-domify');

var app = express();

app.get('/js/app.js', function (req, res) {
  var b = browserify({ detectGlobals: false });
  b.transform(trdomify);
  b.add('./app.js');
  b.bundle(function (err, bundle) {
    if (err) return res.send(400, err.message);
    res.charset = 'utf-8';
    res.type('text/javascript');
    res.send(200, bundle);
  }); 
});

app.get('*', function (req, res, next) {
  readFile(__dirname + '/index.html', 'utf-8', function (err, html) {
    if (err) return next(err);
    res.type('text/html');
    res.send(200, html);
  });
});

app.listen(8080);