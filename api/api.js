#!/usr/bin/env node
const WebSocketServer = require('websocket').server;
const express = require('express');
const bodyParser = require('body-parser');
const SlackBot = require('slackbots');

/*
* Express
*/

var app = express();
var negativeCount = 0;
var positiveCount = 0;

var server = app.listen(8080, function () {
    console.log("Node.js is listening to PORT:" + server.address().port);
});
app.use('/static', express.static(__dirname + '/static'));

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.get('/incr/:type', function(req, res) {
    if(req.params.type == 0) {
        negativeCount++;
        console.log("negativeCount: "+negativeCount);
        if (negativeCount == 5) {
            sendSmellToClient("A");
        }
    }
    if(req.params.type == 1) {
        negativeCount++;
        console.log("positiveCount: "+positiveCount);
        if (positiveCount == 5) {
            sendSmellToClient("B");
        }
    }
    res.send('type:' + req.params.type);
});


/*
* Slack Bot
*/
var bot = new SlackBot({
    token: 'xoxb-263602966868-3D2HKK1BnAGH5g1GE9k1Y1BL', // Add a bot https://my.slack.com/services/new/bot and put the token
    name: 'banana-bot'
});

var timetable = {
    enabled: false,
    state: 0, //0開始前、1セクション数入力、2香り設定、3終了
    numSections: 0,
    sections: [

    ]
};

bot.on('start', function() {
    // more information about additional params https://api.slack.com/methods/chat.postMessage
    var params = {
        as_user: false,
        icon_url: "https://files.slack.com/files-pri/T0MBZ99GF-F7R15P42V/kagikaigi_icon_sq.png"
    };

    // define channel, where bot exist. You can adjust it there https://my.slack.com/services
    bot.postMessageToChannel('banana-test', 'バナナ!', params);
});

bot.on('message', function(data) {
    // all ingoing events https://api.slack.com/rtm
    console.log(data);
    if(data.type !== "message" || data.bot_id == "B7RL9BNSZ"){
        return;
    }

    var text = data.text;

    if(timetable.enabled) {
        createTimetable(text);
        return;
    }

    var smellId;
    if(mc = text.match(/([A-Da-d])\s*発射/)) {
        smellId = mc[1].toUpperCase();
        sendTextToSlack(smellId+"の香りを発射します");
        sendSmellToClient(smellId);
    }else if(mc = text.match(/([ＡＢＣＤａｂｃｄ])\s*発射/)) {
        // console.log(mc);
        smellId = String.fromCharCode(mc[1].charCodeAt(mc[1]) - 65248).toUpperCase();
        sendTextToSlack(smellId+"の香りを発射します");
        sendSmellToClient(smellId);
    }if(text.match(/タイムテーブル/)) {
        timetable.enabled = true;
        timetable.state = 1;
        sendTextToSlack("タイムテーブルを作成します。セクション数を入力してください。");
    }
});

function createTimetable(text) {
    switch (timetable.state) {
        case 1:
            timetable.numSections = Number(text);
            break;
        default:

    }
    console.log(timetable);
}

function sendTextToSlack(text) {
    // more information about additional params https://api.slack.com/methods/chat.postMessage
    var params = {
        as_user: false,
        icon_url: "https://files.slack.com/files-pri/T0MBZ99GF-F7R15P42V/kagikaigi_icon_sq.png"
    };
    bot.postMessageToChannel('banana-test', text, params);
}

/*
* WebSocket client
*/
var connection;

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

/*
 * Utils
 */
function sendSmellToClient(type) {
    var res = {
        command: type
    };
    connection.sendUTF(JSON.stringify(res));
}
