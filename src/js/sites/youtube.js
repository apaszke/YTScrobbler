var YouTubeParser = function YouTubeParser($) {
    
    var extractIdFromUrl = function(url) {
        var vid = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
        if(vid && vid[2]) {
            return vid[2];
        }
        return undefined;
    }
    
    var getVideoInfo = function (id, callback) {
        $.get('http://gdata.youtube.com/feeds/api/videos/'+id, { v: 2, alt: "json" }, function(data) {
            if(data && data.entry) {
                var result = {
                    title: data.entry.title['$t'],
                    description: data.entry['media$group']['media$description']['$t'],
                    description_type: data.entry['media$group']['media$description']['type']
                }
                callback(undefined, result);
            }
        });
    }
    
    this.getInfoForUrl = function(url, callback) {
        var id = extractIdFromUrl(url);
        getVideoInfo(id, function(err, info) {
            callback(undefined, info);
        });
    }
    
    return this;
}

module.exports = YouTubeParser;