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
     * @param   {Object} params Query parameters
     * @returns {String} Query signature
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
        };
        names = names.sort(compare);
        // Serialize parameters
        var serialized = names.reduce(function(prev, curr) {
            return prev += curr + params[curr];
        }, "");
        // Hash result
        return CryptoJS.MD5(serialized+API_SECRET).toString();
    };
    
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
        result.getToken = function getToken(callback) {
            $.get(API_ROOT_URL,
                { method: "auth.getToken", api_key: API_KEY, format: "json"},
                function(data) {
                    token = data.token;
                    if(callback) callback(undefined, data.token);
                });
        };
        /**
         * Check if token has been confirmed, retrieve session and save it in Settings
         * @param {Function} callback Callback function
         */
        result.getSession = function getSession(callback) {
            var params = {method: "auth.getSession",
                          api_key: API_KEY,
                          token: token };
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
        };
        
        return result;
    })(this);
    
    /*
     * SCROBBLE MODULE
     */
    this.scrobble = (function (parent) {
        var result = {};
        /**
         * Scrobble track
         * @param {String}   artist   Artist name
         * @param {String}   title    Title
         * @param {String}   album    (Optional) Album name
         * @param {Function} callback Callback function
         */
        result.send = function sendScrobble(artist, title, album, callback) {
            // Generate parameter object
            var date = Math.floor(Date.now() / 1000);
            var params = {method: "track.scrobble",
                          api_key: API_KEY,
                          sk: settings.getSessionKey(),
                          artist: artist,
                          track: title,
                          timestamp: date};
            if (album) params.album = album;
            //Append signature
            params.api_sig = parent.generateSignature(params);
            // Change format
            params.format = "json";
            // Send request
            $.post(API_ROOT_URL,
                   params,
                   function(data) {
                       if(callback) {
                           if(data.error) {
                               callback(data.error);
                           } else {
                               callback(undefined, data['@attr']);
                           }
                       }
                   });
        };
        
        /**
         * Update Now Playing song
         * @param {String}   artist   Artist name
         * @param {Title}    title    Track title
         * @param {Album}    album    (Optional) Album
         * @param {Function} callback Callback function
         */
        result.updateNowPlaying = function updateNowPlaying(artist, title, album, callback) {
            // Generate parameter object
            var params = {method: "track.updateNowPlaying",
                          api_key: API_KEY,
                          sk: settings.getSessionKey(),
                          artist: artist,
                          track: title};
            if (album) params.album = album;
            // Append signature
            params.api_sig = parent.generateSignature(params);
            // Change format
            params.format = "json";
            // Send request
            $.post(API_ROOT_URL,
                   params,
                   function(data) {
                       if(callback) {
                           if(data.error) {
                               callback(data.error);
                           } else {
                               callback(undefined, data.nowplaying);
                           }
                       }
                   });
        };
        
        return result;
    })(this);
    
    /*
     * TRACK INFO MODULE
     */
    this.track = (function (parent) {
        var result = {};
        result.getInfo = function getTrackInfo(artist, title, callback) {
            $.get(API_ROOT_URL,
                  {method: "track.getInfo",
                   api_key: API_KEY,
                   artist: artist,
                   track: title,
                   format: "json"},
                  function(data) {
                       if(callback) {
                           if(data.error) {
                               callback(data.error);
                           } else {
                               callback(undefined, data.track);
                           }
                       }
                   });
        };
        return result;
    })(this);
    
    /*
     * ARTIST INFO MODULE
     */
    this.artist = (function (parent) {
        var result = {};
        result.getInfo = function getArtistInfo(artist, callback) {
            $.get(API_ROOT_URL,
                  {method: "artist.getInfo",
                   api_key: API_KEY,
                   artist: artist,
                   format: "json"},
                  function(data) {
                       if(callback) {
                           if(data.error) {
                               callback(data.error);
                           } else {
                               callback(undefined, data.artist);
                           }
                       }
                   });
        };
        return result;
    })(this);
    
    return this;
};

module.exports = LastFmAPI;