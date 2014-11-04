'use strict';

var $ = require('../../lib/jquery-2.1.1.min.js');
var CryptoJS = require('../../lib/crypto.js');

var LastFmAPI = function (settings) {
    if(!settings) throw new Error('No Settings passed');
    var API = {};
    var API_KEY = "486587e92b3bd2e9c3217787ca7d1ce2";
    var API_SECRET = "5cc62dbf9d00966ed8535b988c77167d";
    var API_ROOT_URL = "http://ws.audioscrobbler.com/2.0/";
    
    /**
     * Generates signature
     * @param   {[[Type]]} params [[Description]]
     * @returns {[[Type]]} [[Description]]
     */
    this.generateSignature = function generateSignature(params) {
        // Get all keys from parameters
        var names = [];
        for(var key in params) {
            names.push(key);
        }
        // Sort names alphabetically
        var compare = function(a,b) {
            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        }
        names = names.sort(compare);
        // Serialize parameters
        var serialized = names.reduce(function(prev, curr) {
            return prev += curr + params[curr];
        }, "");
        // Hash result
        return CryptoJS.MD5(serialized+API_SECRET).toString();
    }
    
    /*
     * AUTHENTICATION MODULE
     */
    this.auth = (function (parent) {
        var result = {};
        // Temporary token storage
        var token;
        /**
         * Retrieve login token
         * @param {Function} callback Callback function
         */
        result.getToken = function(callback) {
            $.get(API_ROOT_URL,
                { method: "auth.getToken", api_key: API_KEY, format: "json"},
                function(data) {
                    token = data.token;
                    if(callback) callback(undefined, data.token);
                });
        }
        /**
         * Check if token has been confirmed, retrieve session and save it in Settings
         * @param {Function} callback Callback function
         */
        result.getSession = function(callback) {
            var params = {method: "auth.getSession",
                          api_key: API_KEY,
                          token: token }
            var signature = parent.generateSignature(params);
            $.get(API_ROOT_URL,
                  $.extend(params, {api_sig: signature, format: "json"}),
                  function(data) {
                      if(!data.error) {
                        settings.setUser(data.session);
                        callback(undefined, data.session);
                      } else {
                        callback(data.error);
                      }
                  });
        }
        
        return result;
    })(this);
    
    this.scrobble = (function (parent) {
        var result = {};
        result.send = function(artist, title, album) {
            chrome.storage.sync.get("user", function(data) {
                var date = Math.floor(Date.now() / 1000);
                var args = [{name: "method",    value: "track.scrobble"},
                            {name: "api_key",   value: API_KEY},
                            {name: "sk",        value: data.user.session.key},
                            {name: "artist",    value: artist},
                            {name: "track",     value: title},
                            {name: "timestamp", value: date}];
                if (album) args.push[{name: "album", value: album}];
                var signature = parent.generateSignature(args);
                $.post(API_ROOT_URL,
                       parent.argListToObj(args, signature),
                       function(data) {
                           console.log(data);
                       });
            });
        }
        result.updateNowPlaying = function(artist, title, album) {
            chrome.storage.sync.get("user", function(data) {
                var args = [{name: "method",    value: "track.updateNowPlaying"},
                            {name: "api_key",   value: API_KEY},
                            {name: "sk",        value: data.user.session.key},
                            {name: "artist",    value: artist},
                            {name: "track",     value: title}];
                if (album) args.push[{name: "album", value: album}];
                var signature = parent.generateSignature(args);
                $.post(API_ROOT_URL,
                       parent.argListToObj(args, signature),
                       function(data) {
                           console.log(data);
                       });
            });
        }
        return result;
    })(this);
    
    this.track = (function (parent) {
        var result = {};
        result.getInfo = function (artist, track, callback) {
            $.get(API_ROOT_URL,
                  {method: "track.getInfo",
                   api_key: API_KEY,
                   artist: artist,
                   track: track,
                   format: "json"},
                  function(data) {
                      callback(undefined, data.track);
                  });
        }
        return result;
    })(this);
    
    this.artist = (function (parent) {
        var result = {};
        result.getInfo = function (artist, callback) {
            $.get(API_ROOT_URL,
                  {method: "artist.getInfo",
                   api_key: API_KEY,
                   artist: artist,
                   format: "json"},
                  function(data) {
                      callback(undefined, data.artist);
                  });
        }
        return result;
    })(this);
    
    return this;
}

module.exports = LastFmAPI;