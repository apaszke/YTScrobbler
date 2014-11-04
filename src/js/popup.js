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

var lastSmartTag;

$('#smartTagButton').click(function() {
    $('#smartTagButton').toggleClass('red');
    var rawName = chrome.extension.getBackgroundPage().currentTrack.rawName;
    if($('#smartTagContainer').css('display') == "none" && rawName != lastSmartTag) {
        lastSmartTag = rawName;
        $('#smartTagContainer').slideToggle();
        var artistSugg = $('#artist-suggestions').empty();
        var titleSugg = $('#title-suggestions').empty();
        var obvious_separators = [' - ', ' – '];
        var separators = ['-', '–', ':', '~'];
        var tags = [];
        var tmp;
        tmp = rawName.match(/"[^"]+"/g);
        if(tmp) {
            tmp.forEach(function(item) {
                tags.push(item.substr(1, item.length-2));
            });
        }
        tmp = rawName.match(/'[^']+'/g);
        if(tmp) {
            tmp.forEach(function(item) {
                tags.push(item.substr(1, item.length-2));
            });
        }
        obvious_separators.forEach(function(item) {
            tmp = rawName.split(item);
            if(tmp.length > 1) {
                tags = tags.concat(tmp);
            }
        });
        tmp = rawName.split(" ");
        if(tmp.length > 1) {
            tmp = tmp.map(function(item) { return item.trim(); }).filter(function(item) { return item != "" });
            tags = tags.concat(tmp);
        }
        separators.forEach(function(separator) {
            tmp = rawName.split(separator);
            if(tmp.length > 1) {
                tmp = tmp.map(function(item) { return item.trim(); }).filter(function(item) { return item != "" });
                tags = tags.concat(tmp);
            }
        });
        tags = tags.map(function(item) {
            if(['"', "'", '(', ')', '[', ']'].indexOf(item.slice(-1)) > -1) item = item.substr(0, item.length-1).trim();
            if(['"', "'", '(', ')', '[', ']'].indexOf(item.substr(0, 1)) > -1) item = item.substr(1, item.length-1).trim();
            return item;
        });
        tags = tags.filter(function(item) {
            return item != "";
        });
        function unique(list) {
            var result = [];
            for(var i = 0; i < list.length; i++) {
                var elem = list[i];
                var unique = true;
                for(var ii = i+i; ii < list.length; ii++) {
                    if (list[ii] == elem) {
                        unique = false;
                        break;
                    }
                }
                if(unique) result.push(elem);
            }
            return result;
        }
        tmp = rawName.match(/\(.*?remix\)/ig);
        if(tmp && tmp.length) tags = tags.concat(tmp);
        tags = tags.map(function(item) {
            return item.trim();
        });
        tags = unique(tags);
        tags.forEach(function(tag) {
            artistSugg.append($('<span class="btn suggestion as">'+tag+'</span>'));
            titleSugg.append($('<span class="btn suggestion ts">'+tag+'</span>'));
        });
        console.log(tags);

        artistSugg.append($('<span class="editArtist"><span class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x fa-interactive"></i><i class="fa fa-pencil fa-stack-1x fa-inverse"></i></span></span>'));
        titleSugg.append($('<span class="editTitle"><span class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x fa-interactive"></i><i class="fa fa-pencil fa-stack-1x fa-inverse"></i></span></span>'));

        $('.suggestion').click(function() {
            $(this).toggleClass('selected-suggestion');
        });
        
        $('.editArtist').click(function() {
            var parent = $(this).parent();
            var elements = parent.find('span');
            var selected = "";
            $('.selected-suggestion.as').each(function() {
                selected += $(this).text() + " ";
            });
            selected.trim();
            if(selected.length == 0) selected = $('#artist').text();
            parent.height(parent.height());
            elements.fadeOut(200, function() {
                parent.empty();
                parent.append($('<input type="textbox" id="artistTextBox"/>').val(selected).hide());
                parent.find('input').fadeIn(400);
                $('#artistTextBox').keyup(function(e){
                    if(e.keyCode == 13)
                    {
                        $('#confirm').click();
                    }
                });
            });
        });

        $('.editTitle').click(function() {
            var parent = $(this).parent();
            var elements = parent.find('span');
            var selected = "";
            $('.selected-suggestion.ts').each(function() {
                selected += $(this).text() + " ";
            });
            selected.trim();
            if(selected.length == 0) selected = $('#title').text();
            parent.height(parent.height());
            elements.fadeOut(200, function() {
                parent.empty()
                parent.append($('<input type="textbox" id="titleTextBox"/>').val(selected).hide());
                parent.find('input').fadeIn(400);
                $('#titleTextBox').keyup(function(e){
                    if(e.keyCode == 13)
                    {
                        $('#confirm').click();
                    }
                });
            });
        });
    } else {
        $('#smartTagContainer').slideToggle();
    }
});

$('#confirm').click(function() {
    $('#smartTagContainer').slideToggle();
    $('#smartTagButton').toggleClass('red');
    if($('#artistTextBox').length) {
        $('#artist').text($('#artistTextBox').val());
    } else if($('.selected-suggestion.as').length) {
        var selected = "";
        $('.selected-suggestion.as').each(function() {
            selected += $(this).text() + " ";
        });
        selected.trim();
        if(selected.length) $('#artist').text(selected);
    }
    if($('#titleTextBox').length) {
        $('#title').text($('#titleTextBox').val());
    } else if($('.selected-suggestion.ts').length) {
        var selected = "";
        $('.selected-suggestion.ts').each(function() {
            selected += $(this).text() + " ";
        });
        selected.trim();
        if(selected.length) $('#title').text(selected);
    }
    chrome.runtime.sendMessage({type: 'USER_SONG', title: $('#title').text(), artist: $('#artist').text()});
});

$('#notificationsCheckbox').click(function() {
    chrome.runtime.sendMessage({type: 'SETTINGS', notifications: $(this).prop('checked')});
});
$('#scrobbleCheckbox').click(function() {
    chrome.runtime.sendMessage({type: 'SETTINGS', scrobble: $(this).prop('checked')});
});
