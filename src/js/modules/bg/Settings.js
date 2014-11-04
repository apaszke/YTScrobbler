var Settings = function() {
    this.notifications = true;
    this.scrobble = true;
    var _this = this;
    var user;
    
    this.init = function initSettings(callback) {
        chrome.storage.sync.get("settings", function(data) { 
            if(data.settings) {
                _this.notifications = data.settings.notifications;
                _this.scrobble = data.settings.scrobble;
                user = data.settings.user;
            } else {
                _this.notifications = true;
                _this.scrobble = true;
                _this.save();
            }
            if(callback) callback();
        });
    };
    this.setNotifications = function setNotifications(val) {
        _this.notifications = val;
        _this.save();
    };
    this.setScrobble = function setScrobble(val) {
        _this.scrobble = val;
        _this.save();
    };
    this.setUser = function setUser(val) {
        if(!user) {
            user = val;
            _this.save();
        }
    };
    this.getSessionKey = function getSessionKey() {
        return user.key;
    }
    this.save = function saveSettings() {
        chrome.storage.sync.set({'settings': {notifications: _this.notifications,
                                              scrobble: _this.scrobble,
                                              user: user}}, function() {});
    };
    this.clear = function clearSettings() {
        chrome.storage.sync.remove('settings', function() {});
    };
    return this;
};

module.exports = Settings;