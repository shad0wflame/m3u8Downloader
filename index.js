const fs = require('fs');
const { URL } = require('url');
const { twitter, animeid, crunchyroll } = require('./examples');
const M3U8Downloader = require('./m3u8downloader.js');

//let downloader = new M3U8Downloader(new URL('https://s101.slyid.com/hls/fhrlmopjaiwxi2pnhtifq6k5fzergw7jyitqaniybkpdzurq6dvh4siqb4za/index-v1-a1.m3u8'));
//let downloader = new M3U8Downloader(new URL('https://video.twimg.com/ext_tw_video/977753441849126913/pu/pl/640x360/kaIu00M3Jm9LPQ0z.m3u8'));
let downloader = new M3U8Downloader(new URL('https://v.redd.it/vupdu2sbare11/HLS_600_K_v4.m3u8'));


// Event driven

downloader.on('finish', file => {
    fs.writeFile('test-event.ts', file, err => {
        if(err) {
            console.error(err);
        }
    });
});


// Stream driven

const wStream = fs.createWriteStream('test-stream.ts');
downloader.pipe(wStream);




