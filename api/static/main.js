
window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
recognition = new webkitSpeechRecognition();
recognition.lang = 'ja';
recognition.continuous = true;
recognition.interimResults = true;

var negativeWords = /だめ|ダメ|でも|しかし|いや|嫌|良くない|最悪|悪い/;
var positiveWords = /おっけー|OK|はい|了解|なるほど|いいね/;

function record() {
    recognition.start();
    console.log("started");
}

function stop() {
    recognition.stop();
    console.log("stopped");

}

function abort() {
    recognition.abort();
    console.log("aborted");

}

// 録音終了時トリガー
recognition.addEventListener('result', function(event){
    var text = event.results.item(0).item(0).transcript;
    $("#result_text").val(text);
    // console.log(event.results);
    // if(text.length > 10) {
    //     stop();
    // }

    // if(event.results.item(0).isFinal) {
        if(negativeWords.test(text)) {
            console.log("negative");
            $.get("https://kyamuise.xyz:1242/incr/1");
            abort();
            setTimeout(function () {
                record();
            }, 5000);
        }
        console.log(event.results);
        // setTimeout(record, 50);
    // }
}, false);


$(function() {
    $("#recStart").on("click", (e) =>{
        record();
    });
});
