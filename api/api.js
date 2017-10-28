#!/usr/bin/env node
const WebSocketServer = require('websocket').server;
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

var app = express();

var connection;

var server = app.listen(8080, function () {
    console.log("Node.js is listening to PORT:" + server.address().port);
});
app.use('/static', express.static(__dirname + '/static'));


var negativeCount = 0;
var positiveCount = 0;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        } else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});


app.post('/', function(req, res) {
    // リクエストボディを出力
    console.log(req.body);
    console.log('Slack webhook recieved');

});

app.get('/incr/:type', function(req, res) {
    if(req.params.type == 0) {
        negativeCount++;
        console.log("negativeCount: "+negativeCount);
        if (negativeCount == 5) {
            sendSmell(0);
        }
    }
    if(req.params.type == 1) {
        negativeCount++;
        console.log("positiveCount: "+positiveCount);
        if (positiveCount == 5) {
            sendSmell(1);
        }
    }
    res.send('type:' + req.params.type);
});

function sendSmell(type) {
    var res = {
        command: type
    };
    connection.sendUTF(JSON.stringify(res));
}
