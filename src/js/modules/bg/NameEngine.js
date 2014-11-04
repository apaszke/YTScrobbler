function stripName(track) {
    track = track.replace(/\s*\([^\)]*version\)$/i, ''); // (whatever version)
    track = track.replace(/\s*\.(avi|wmv|mpg|mpeg|flv)$/i, ''); // video extensions
    track = track.replace(/\s*(LYRIC VIDEO\s*)?(lyric video\s*)/i, ''); // (LYRIC VIDEO)
    track = track.replace(/\s*(Official Track Stream*)/i, ''); // (Official Track Stream) 
    track = track.replace(/\s*(of+icial\s*)?(music\s*)?video/i, ''); // (official)? (music)? video
    track = track.replace(/\s*(of+icial\s*)?(music\s*)?audio/i, ''); // (official)? (music)? audio
    track = track.replace(/\s*(ALBUM TRACK\s*)?(album track\s*)/i, ''); // (ALBUM TRACK)
    track = track.replace(/\s*(COVER ART\s*)?(Cover Art\s*)/i, ''); // (Cover Art)
    track = track.replace(/\s*\(\s*of+icial\s*\)/i, ''); // (official)
    track = track.replace(/\s*\(\s*[0-9]{4}\s*\)/i, ''); // (1999)
    track = track.replace(/\s+\(\s*(HD|HQ)\s*\)$/, ''); // HD (HQ)
    track = track.replace(/\s+(HD|HQ)\s*$/, ''); // HD (HQ)
    track = track.replace(/\s*video\s*clip/i, ''); // video clip
    track = track.replace(/\(+\s*\)+/, ''); // Leftovers after e.g. (official video)
    track = track.replace(/\[+\s*\]+/, ''); // Leftovers after e.g. (official video)
    track = track.replace(/^[\/\s,:;~-\s"]+/, ''); // trim starting white chars and dash
    track = track.replace(/[\/\s,:;~-\s"\s!]+$/, ''); // trim trailing white chars and dash
    track = track.replace(/\s+(720p|1080p|4k)\s*$/i, ''); // 720p 1080p 4k
    track = track.replace(/\s+Free Download\s*$/i, ''); // Free Download
    track = track.replace(/\s+\[official\]\s*/i, ''); // [official]
    track = track.replace(/\s+Lyrics\s*/i, ''); // Lyrics
    //track = track.replace(/[\[\]\(\)]/g, '');
    return track;
}

/*
 * Check name[0]&name[1], name[1]&name[0] (if possible name[0]&name[2])
 */