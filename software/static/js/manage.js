const win = $(window);
const player = $('#videoPlayer');
const textInput = $('#textInput');
const directButton = $('#directButton');

const playerAspectRatio = 16 / 9;
let playing = false;

$(document).ready(() => {
    player.width(1280);
    player.height(720);

    resizePlayer();

    manageVideo();
});

$(window).resize(() => {
    resizePlayer();
});

textInput.keypress(event => {
    if (directButton.hasClass('active')) {
        sendText(String.fromCharCode(event.which));
        setTimeout(() => textInput.val(''), 300);
    } else {
        if (event.which === 13) sendCommand();
    }
});

$('#sendButton').click(() => sendCommand());

$('.toggle-btn').click(function () {
    const btn = $(this);
    if (btn.hasClass('active')) btn.removeClass('active');
    else btn.addClass('active');
});

$('.kb-button').click(function (event) {
    const btn = $(this);

    if (btn.hasClass('toggle-btn')) {
        if (event.shiftKey) {
            tapKey(btn.data('shift-key'));
        } else {
            if (btn.hasClass('active')) {
                pressKey(btn.data('key'));
            } else {
                releaseKey(btn.data('key'));
            }
        }
    } else {
        tapKey(btn.data('key'));
    }
});

function manageVideo() {
    const videoPlayer = player[0];

    const jmuxer = new JMuxer({
        node: videoPlayer,
        mode: 'video',
        flushingTime: 100
    });

    const ws = new WebSocket(`ws://${window.location.host}`);

    ws.onmessage = function (event) {
        if (event.data instanceof Blob) {
            const fileReader = new FileReader();
            fileReader.onload = function (e) {
                if (!playing) {
                    playing = true;
                    player[0].muted = true;
                    player[0].play();
                }

                jmuxer.feed({
                    video: new Uint8Array(e.target.result)
                });
            };
            fileReader.readAsArrayBuffer(event.data);
        }
    };

    ws.onerror = function (error) {
        console.log('WebSocket Error: ' + error);
    };

    ws.onclose = function () {
        console.log('WebSocket closed');
        jmuxer.destroy();
        videoPlayer.pause();
        videoPlayer.src = "";
        videoPlayer.load();
    };
}

function resizePlayer() {
    let newWidth;
    let newHeight;

    if (win.width() / win.height() > playerAspectRatio) {
        newWidth = win.height() * playerAspectRatio;
        newHeight = win.height();
    } else {
        newWidth = win.width();
        newHeight = win.width() / playerAspectRatio;
    }

    if (newWidth > 1280 || newHeight > 720) {
        newWidth = 1280;
        newHeight = 720;
    }

    player.width(newWidth);
    player.height(newHeight);
}

function sendText(text) {
    $.ajax({
        url: '/api/text',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({text: text})
    });
}

function sendCommand() {
    const text = textInput.val();
    if (text.length === 0) return;
    sendText(text);

    textInput.val('');
}

function pressKey(key) {
    $.ajax({
        url: '/api/press_key',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({key: key})
    });
}

function releaseKey(key) {
    $.ajax({
        url: '/api/release_key',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({key: key})
    });
}

function tapKey(key) {
    $.ajax({
        url: '/api/tap_key',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({key: key})
    });
}