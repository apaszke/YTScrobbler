var CacheManager = function() {
    var memCache = {};
    this.init = function(callback) {
        chrome.storage.sync.get("cache", function(data) { memCache = data.cache || {}; });
    }
    this.change = function(obj) {
        //TODO ograniczenie cache
        memCache[obj.url] = {title: obj.title, artist: obj.artist};
    }
    this.check = function(url) {
        return memCache[url];
    }
    this.save = function() {
        chrome.storage.sync.set({'cache': memCache}, function() {});
    }
    this.clear = function() {
        chrome.storage.sync.remove('cache', function() {});
    }
    return this;
}