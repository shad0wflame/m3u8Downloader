const { URL } = require('url');
const fs = require('fs');
const { twitter, animeid, crunchyroll } = require('./examples');
const M3U8Downloader = require('./m3u8downloader.js');

let downloader = new M3U8Downloader(crunchyroll);

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




