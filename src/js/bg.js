var LastFmAPI = require('./modules/bg/LastFmAPI.js');
var Settings = require('./modules/bg/Settings.js');

window.settings = new Settings();
window.API = new LastFmAPI(window.settings);

//chrome.runtime.onMessage.addListener(function(req, sender) {
//    console.log(req);
//    function compareAndUpdateCurrentTrack(data, artist, title) {
//        console.log(data);
//        var result;
//        for(var i = 0; i < data.length; i++) {
//            if(data[i] && data[i].mbid) {
//                result = data[i];
//                break;
//            }
//        }
//        for(var i = 0; i < data.length; i++) {
//            if(result) break;
//            if(data[i]) {
//                result = data[i];
//                break;
//            }
//        }
//        currentTrack.title = "";
//        currentTrack.album = "";
//        currentTrack.photoSrc = "";
//        currentTrack.artist = "";
//        
//        if(result) {
//            currentTrack.title = result.name;
//            if (result.album) {
//                currentTrack.album = result.album.title;
//                currentTrack.artist = result.album.artist;
//                if(result.album.image) {
//                    currentTrack.photoSrc = result.album.image[2]['#text'];
//                } else {
//                    lastFmApi.artist.getPhoto(currentTrack.artist, function(err, data) {
//                        currentTrack.photoSrc = data.image[2]['#text'];
//                        chrome.runtime.sendMessage({type: 'UI_UPDATE'});
//                    });
//                }
//            } else if(result.artist) {
//                currentTrack.artist = result.artist.name;
//                lastFmApi.artist.getPhoto(currentTrack.artist, function(err, data) {
//                    currentTrack.photoSrc = data.image[2]['#text'];
//                    chrome.runtime.sendMessage({type: 'UI_UPDATE'});
//                });
//            }
//        } else {
//            currentTrack.title = title;
//            currentTrack.artist = artist;
//        }
//        chrome.runtime.sendMessage({type: 'UI_UPDATE'});
//        
//        if(settings.notifications) {
//            //TODO Lepszy sposób na załadowanie photo od artysty
//            setTimeout(function() {
//                chrome.notifications.create("", {type: "basic", iconUrl: currentTrack.photoSrc ? currentTrack.photoSrc : "img/logo.png", title: "New track", message: currentTrack.artist+' - '+currentTrack.title, contextMessage: currentTrack.album}, function(id) {notificationId = id;});
//            }, 1000);
//        }
//    }
//        
//    
//    if(req.type == 'NEW_SONG') {
//        var anythingFound = false;
//        var obvious_separators = [' - ', ' – ', '-'];
//        var separators = ['-', '–', ':', '~'];
//        currentTrack = currentTrack || {};
//        currentTrack.rawName = stripName(req.rawName);
//        currentTrack.url = sender.url;
//        if(cache.check(sender.url)) {
//            var tmp = cache.check(sender.url);
//            lastFmApi.track.getInfo(tmp.artist, tmp.title, function(err, data) {
//                compareAndUpdateCurrentTrack([data], tmp.artist, tmp.title);
//            });
//        } else {
//            var browse_separators = function(separator, index) {
//                
//                var tmp = stripName(req.rawName).split(separator);
//                tmp = tmp.map(function(item) {
//                    return stripName(item);
//                });
//                if(tmp.length > 1) {
//                    anythingFound = true;
//                    if(tmp.length >= 2) {
//                        lastFmApi.track.getInfo(tmp[0], tmp[1], function(err, data1) {
//                            setTimeout(function() {
//                                if(currentTrack.rawName == stripName(req.rawName))
//                                lastFmApi.track.getInfo(tmp[1], tmp[0], function(err, data2) {
//                                    if(tmp.length > 2) {
//                                        if(currentTrack.rawName == stripName(req.rawName))
//                                        lastFmApi.track.getInfo(tmp[0], tmp[2], function(err, data3) {
//                                            compareAndUpdateCurrentTrack([data1, data2, data3], tmp[0], tmp[1]);
//                                        });
//                                    } else {
//                                        compareAndUpdateCurrentTrack([data1, data2], tmp[0], tmp[1]);
//                                    }
//                                });
//                            }, 1000);
//                        });
//                    }
//                } else {
//                    if(index == obvious_separators.length - 1 && !anythingFound) {
//                        currentTrack.title = "";
//                        currentTrack.album = "";
//                        currentTrack.photoSrc = "";
//                        currentTrack.artist = "";
//                        if(settings.notifications) {
//                            chrome.notifications.create("", {type: "basic", iconUrl: "img/logo.png", title: "Can't recognize track", message: "Go to SmartTag"}, function(id) {});
//                        }
//                    }
//                    if(!anythingFound && index < obvious_separators.length -1) {
//                        browse_separators(obvious_separators[index+1], index+1);
//                    }
//                }
//            }
//            browse_separators(obvious_separators[0], 0);
//        }
//    } else if(req.type == 'SCROBBLE') {
//        if(currentTrack.artist != "" && currentTrack.title != "" && settings.scrobble) {
//            lastFmApi.scrobble.send(currentTrack.artist, currentTrack.title, currentTrack.album);
//            if(settings.notifications) {
//                chrome.notifications.create("", {type: "basic", iconUrl: currentTrack.photoSrc ? currentTrack.photoSrc : "img/logo.png", title: "Track scrobbled!", message: currentTrack.artist+' - '+currentTrack.title, contextMessage: currentTrack.album}, function(id) {notificationId = id;});
//            }
//        }
//    } else if(req.type == 'USER_SONG') {
//        currentTrack.title = req.title;
//        currentTrack.artist = req.artist;
//        currentTrack.album = "";
//        currentTrack.photoSrc = "";
//        chrome.runtime.sendMessage({type: 'UI_UPDATE'});
//        lastFmApi.track.getInfo(req.artist, req.title, function(err, result) {
//            if(result) {
//                currentTrack.title = result.name;
//                if (result.album) {
//                    currentTrack.album = result.album.title;
//                    currentTrack.artist = result.album.artist;
//                    if(result.album.image) {
//                        currentTrack.photoSrc = result.album.image[2]['#text'];
//                    } else {
//                        lastFmApi.artist.getPhoto(currentTrack.artist, function(err, data) {
//                            currentTrack.photoSrc = data.image[2]['#text'];
//                            chrome.runtime.sendMessage({type: 'UI_UPDATE'});
//                        });
//                    }
//                } else if(result.artist) {
//                    currentTrack.artist = result.artist.name;
//                    lastFmApi.artist.getPhoto(currentTrack.artist, function(err, data) {
//                        currentTrack.photoSrc = data.image[2]['#text'];
//                        chrome.runtime.sendMessage({type: 'UI_UPDATE'});
//                    });
//                }
//            } else {
//                currentTrack.title = title;
//                currentTrack.artist = artist;
//            }
//            chrome.runtime.sendMessage({type: 'UI_UPDATE'});
//        });
//        cache.change({url: currentTrack.url, title: req.title, artist: req.artist});
//        cache.save();
//    } else if(req.type == 'SETTINGS') {
//        
//        if(req.notifications != undefined) settings.setNotifications(req.notifications);
//        if(req.scrobble != undefined) settings.setScrobble(req.scrobble);
//    } else if(req.type == 'UI_UPDATE') {
//        lastFmApi.track.updateNowPlaying(currentTrack.artist, currentTrack.title, currentTrack.album);
//    }
//});


//chrome.tabs.onUpdated.addListener(function(id, info, state) {
//    if(state.status == "complete") {
//        try {
//            chrome.tabs.executeScript(null, {file: "js/sniffer.js"});
//        } catch (e) {
//        }
//    }
//});