#!/usr/bin/env node
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
            let body = JSON.parse(message.utf8Data)
            sendCommand(body.command, body.duration);//TODO ここはSlackをよしなに
        }
    });

    function sendJson(obj) {
        if (connection.connected) {
            connection.sendUTF(JSON.stringify(obj));
            setTimeout(sendNumber, 1000);
        }
    }

});

var sendCommand = function (command, duration) {
    const request = require('request');

    var URL = 'http://192.168.0.4:8000/cgi-bin/Banana.py';

    request.get({
        uri: URL,
        qs: {
            command: command,
            duration: duration
        },
    }, function(err, req, data){
        console.log(data);
    });
}

client.connect('ws://kyamuise.xyz:5000/', 'echo-protocol');
