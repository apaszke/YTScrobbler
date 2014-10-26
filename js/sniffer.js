setTimeout(function() {
if(document.location.toString().indexOf('youtube') > -1) {
    if(document.querySelector('#player')) {
        var title = document.querySelector('#eow-title').innerText.trim();
        chrome.runtime.sendMessage({type: 'NEW_SONG', rawName: title});
        function strToTime(timestamp) {
            var splits = timestamp.split(':');
            return (parseInt(splits[0]) * 60) + parseInt(splits[1]);
        }
        //TODO Scrobble po przewijaniu
        function checkTime() {
            var current = document.querySelector('.ytp-time-current').innerHTML.trim();
            var total = document.querySelector('.ytp-time-duration').innerHTML.trim();
            console.log(strToTime(current), strToTime(total) / 2);
            if(strToTime(current) < strToTime(total) / 2) {
                setTimeout(checkTime, 2000);
            } else {
                if(!alreadyScrobbled) {
                    chrome.runtime.sendMessage({type: 'SCROBBLE'});
                }
                alreadyScrobbled = true;
            }
        }
        checkTime();
    }
}
}, 1500);
var alreadyScrobbled = false;