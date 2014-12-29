var express = require('express');
var path = require('path');
var app = express();
var http = require('http');
var server = http.createServer(app);
var env = require('node-env-file');

app.use('/', express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

// Load any undefined ENV variables form a specified file.
// env(__dirname + '/.env');

var port = process.env.PORT || 5000;
// server.listen(port, 'localhost');
server.listen(port);
server.on('listening', function() {
  console.log('Express server started on port %s at %s', server.address().port, server.address().address);
});
