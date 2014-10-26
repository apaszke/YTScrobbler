document.addEventListener('DOMContentLoaded', function () {
        var bgPage = chrome.extension.getBackgroundPage();
        var currentTrack = bgPage.currentTrack;
        var settings = bgPage.settings;
        if(bgPage.user) {
            $('header').append('Logged as: <span id="username"></span><div style="float:right; font-size: 20px; position:relative; top:-4px;" id="logout"><i class="fa fa-power-off"></i></div>');
            $('#logout').click(function() {
                chrome.storage.sync.clear();
                bgPage.user = undefined;
                bgPage.currentTrack = undefined;
                bgPage.token = undefined;
                window.close();
            });
            $("#username").text(bgPage.user.session.name);
            $('#title').text(currentTrack.title || "");
            $('#album').text(currentTrack.album || "");
            $('#artist').text(currentTrack.artist || "");
            $('#cover-img').attr('src', currentTrack.photoSrc || "img/notAvailable.png");
            $('#scrobbleCheckbox').attr('checked', settings.scrobble);
            $('#notificationsCheckbox').attr('checked', settings.notifications);
            if((chrome.extension.getBackgroundPage().currentTrack.rawName != '') && ($('#title').text() == "" || $('#artist').text() == "")) {
                console.log($('#artist').text(), $('#title').text(), chrome.extension.getBackgroundPage().currentTrack.rawName);
               setTimeout(function() { $('#smartTagButton').click() }, 250);
            }
        } else {
            chrome.extension.getBackgroundPage().login();
            window.close();
        }
});

chrome.runtime.onMessage.addListener(function(req, sender) {
    console.log(req);
    if(req.type == 'UI_UPDATE') {
        var bgPage = chrome.extension.getBackgroundPage();
        var currentTrack = bgPage.currentTrack;
        $('#title').text(currentTrack.title || "");
        $('#album').text(currentTrack.album || "");
        $('#artist').text(currentTrack.artist || "");
        $('#cover-img').attr('src', currentTrack.photoSrc || "img/notAvailable.png");
    } else if(req.type == 'SCROBBLE') {
    }
});