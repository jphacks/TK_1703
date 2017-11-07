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
var furefureCount = 0;

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
            negativeCount = 0;
        }
    }
    if(req.params.type == 1) {
        positiveCount++;
        console.log("positiveCount: "+positiveCount);
        if (positiveCount == 5) {
            sendSmellToClient("B");
            positiveCount = 0;
        }
    }
    res.send('type:' + req.params.type);
});

app.get('/furefure', function(req, res) {
    furefureCount++;

    if(furefureCount == 50) {
        furefureCount = 0;
        sendSmellToClient("A");
    }
    res.send('furefure accepted:'+furefureCount);

});

app.get('/kikkake/:smellId', function(req, res) {
    var smellId = req.params.smellId;
    if(smellId.match(/([A-D])/)) {
        res.send(smellId+"の香りを発射します");
        sendSmellToClient(smellId);
    } else {
        res.send("invalid smell ID");
    }
});

/*
* Slack Bot
*/
var bot = new SlackBot({
    token: process.env.SLACK_BOT_KEY, // Add a bot https://my.slack.com/services/new/bot and put the token
    name: 'Perfumecation',
    icon_url: "https://files.slack.com/files-pri/T0MBZ99GF-F7R15P42V/kagikaigi_icon_sq.png"
});

var timetable = {
    enabled: false,
    state: 0, //0開始前、1セクション数入力完了、2時間設定完了, 3香り設定完了、4終了
    numSections: 0,
    sections: [

    ],
    startTime: 0,
    currentSection: 0
};

var otsuCurry = {
    enabled: false,
    duration: 0,
    smellId: "A"
};
var otsuCurryTimer;

bot.on('start', function() {
    // more information about additional params https://api.slack.com/methods/chat.postMessage
    var params = {
        as_user: false,
    };

    // define channel, where bot exist. You can adjust it there https://my.slack.com/services
    bot.postMessageToChannel('banana-test', 'Hello!', params);
});

bot.on('message', function(data) {
    // all ingoing events https://api.slack.com/rtm
    console.log(data);
    if(data.type !== "message" || data.bot_id == "B7RL9BNSZ"){
        return;
    }

    var text = data.text;

    if(timetable.enabled === true || text.match(/タイムテーブル/)) {
        timetableMode(text);
        return;
    } else if(otsuCurry.enabled == true || text.match(/.*(会議(開始|はじめ|始め|スタート|すたーと)|(おつかりー|おつカリー|オツカリー)).*/)) {
        console.log("会議はじめ");
        otsuCurryMode(text);
    } else {
        simpleMode(text);
        return;
    }
});

function simpleMode(text) {
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
    }else{
        sendTextToSlack("有効コマンドじゃないよ！");
    }
}

function otsuCurryMode(text) {
    if(otsuCurry.enabled == false) {
        sendTextToSlack("おつかりーモード始めるよ！\n何分の会議？");
        otsuCurry.enabled = true;
    } else if (otsuCurry.duration == 0) {
        mc = text.match(/(\d+)分?/);
        otsuCurry.duration = Number(mc[1])*60*1000;
        console.log(mc[1]+"分");
        sendTextToSlack(mc[1]+"分だね。会議スタート！");
        setTimeout(() => {
            sendSmellToClient(otsuCurry.smellId);
        }, otsuCurry.duration);
    } else if(text.match(/.*(キャンセル|取り消し|取消|破棄|やめる|完了|終わり|おわり).*/)) {
        sendTextToSlack("おつカレー！！今日は良い会議ができたね！\nさあ、一緒に踊ろう :dancer: ");
        initOtsuCurry();
        return;
    }
}

function timetableMode(text) {
    if(timetable.enabled === false) {
        timetable.enabled = true;
        timetable.state = 1;
        sendTextToSlack("タイムテーブルを作成します。セクション数を入力してください。");
        return;
    } else if(text.match(/キャンセル|取り消し|取消|破棄|やめる/)) {
        initTimetable();
        sendTextToSlack("タイムテーブルを破棄しました。");
        return;
    } else {
        constructTimetable(text);
        return;
    }
}

function constructTimetable(text) {
    switch (timetable.state) {
        case 1:
            timetable.numSections = Number(text);
            timetable.state = 2;//時間入力待ち
            sendTextToSlack((timetable.sections.length+1)+"番目のセクションは何分間ですか？");
            break;
        case 2:
            timetable.sections.push({duration: Number(text)*60*1000});
            timetable.state = 3; //香り入力待ち
            sendTextToSlack((timetable.sections.length)+"番目のセクションの香りを設定してください。");
            break;
        case 3:
            timetable.sections[timetable.sections.length-1].smellId = text;
            if(timetable.sections.length < timetable.numSections){
                timetable.state = 2;//時間入力待ち
            } else {
                timetable.state = 4;//完了
                sendTextToSlack("タイムテーブルの作成が完了しました！\nスタートしました！");
                timetable.startTime = new Date();
                sendTextToSlack(JSON.stringify(timetable));
                timetableTransitions();
                break;
            }
            sendTextToSlack((timetable.sections.length+1)+"番目のセクションは何分間ですか？");
            break;
        case 4:
            sendTextToSlack("タイムテーブルが作成されています！");
            sendTextToSlack(JSON.stringify(timetable));
            break;
        default:
    }
    console.log(timetable);
}

function timetableTransitions() {
    let current = timetable.currentSection;
    let section = timetable.sections[current];
    let smellId = section.smellId;
    let duration = section.duration;

    if (timetable.numSections == current) {
        sendTextToSlack("終了です");
        initTimetable();
    }

    sendSmellToClient(smellId);
    sendTextToSlack((current+1)+"番目のセクションです。香り"+smellId+"を発射します。");
    setTimeout(() => {
        timetable.currentSection += 1;
    }, duration);
}

function initTimetable() {
    timetable = {
        enabled: false,
        state: 0,
        numSections: 0,
        sections: [],
        startTime: 0,
        currentSection: 0
    }
    return;
}

function initOtsuCurry() {
    otsuCurry = {
        enabled: false,
        duration: 0,
        smellId: "A"
    };
    clearTimeout(otsuCurryTimer);
    return;
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
