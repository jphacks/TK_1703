#!/usr/bin/env node
const WebSocketClient = require('websocket').client;
const request = require('request');
const child_process = require('child_process');

var client = new WebSocketClient();

client.on('connectFailed', error => {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', connection => {
    console.log('WebSocket Client Connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', () =>  {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', message => {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
            let body = JSON.parse(message.utf8Data);
            if(body.type == "spout") {
                execSpoutSmell(body.slotId, body.amount);
            } else if (body.type == "init") {
                init();
            }
        }
    });

    function sendJson(obj) {
        if (connection.connected) {
            connection.sendUTF(JSON.stringify(obj));
            setTimeout(sendNumber, 1000);
        }
    }

});

let init = () => {
    slotConsumed = {A: 0, B: 0, C: 0, D: 0, E: 0, F: 0, G: 0, H: 0, X: 0};
    execSpoutSmell("X", 1);
}

let execSpoutSmell = (slotId, amount) => {

    if (slotConsumed[slotId] === undefined) {
        throw SlotExeption("Invalid Slot ID: " + slotId);
    }

    var cmd = "python3 ../pi/spoutSmell.py " + slotId + " " + slotConsumed[slotId] + " " + amount;

    slotConsumed[slotId] += amount;
    
    /* TODO クールタイム */
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

let SlotExeption = (message) => {
    this.message = message;
    this.name = "SlotExeption";
 }

init();
client.connect('ws://kyamuise.xyz:5000/', 'echo-protocol');
