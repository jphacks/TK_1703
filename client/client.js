#!/usr/bin/env node
const WebSocketClient = require('websocket').client;
const request = require('request');
const child_process = require('child_process');



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
            execCommand(body.command, body.duration);//TODO ここはSlackをよしなに
        }
    });

    function sendJson(obj) {
        if (connection.connected) {
            connection.sendUTF(JSON.stringify(obj));
            setTimeout(sendNumber, 1000);
        }
    }

});

var execCommand = function (smellType, duration) {

    var cmd = '../pi/spoutSmell ' + smellType;

    child_process.exec(cmd, (error, stdout, stderr) => {
        if ( error instanceof Error) {
            console.error(error);
            console.log('exec Error *******');
        } else {
            console.log(stdout);
            console.log('spoutSmell command executed!');
    }
    });
}


client.connect('ws://kyamuise.xyz:5000/', 'echo-protocol');
