
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
    if(text.length > 10) {
        stop();
    }
    $.get("https://kyamuise.xyz:5000/incr/1");

    if(event.results.item(0).isFinal) {
        if(/だめ|ダメ|でも|しかし|いや|嫌/.test(text)) {
            console.log("negative");
            $.get("http://kyamuise.xyz:5000/incr/1");
        }
        console.log(event.results);
        setTimeout(record, 50);
    }
}, false);


$(function() {
    $("#recStart").on("click", (e) =>{
        record();
    });
});
