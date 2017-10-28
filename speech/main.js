
window.SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
recognition = new webkitSpeechRecognition();
recognition.lang = 'ja';
recognition.continuous = true;
recognition.interimResults = true;

function record() {
    recognition.start();
}

function stop() {
    recognition.stop();
}

// 録音終了時トリガー
recognition.addEventListener('result', function(event){
    var text = event.results.item(0).item(0).transcript;
    $("#result_text").val(text);
    // console.log(event.results);
    if(text.length > 50) {
        stop();
    }
    if(event.results.item(0).isFinal) {
        if(/だめ|ダメ|でも|しかし|いや|嫌/.test(text)) {
            console.log("negative");
        }
        console.log(event.results);
        setTimeout(record, 1);
    }
}, false);


$(function() {
    $("#recStart").on("click", (e) =>{
        record();
    });
});
