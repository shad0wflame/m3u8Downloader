const { request }  = require('https');
const EventEmitter = require('events');
const M3U8Parser = require('./parser');
const PassthroughStream = require('./passthrough-stream');

let _private = new WeakMap();

class M3U8Downloader {

    constructor(url) {

        this.parser = new M3U8Parser(url);

        /** { Array<URL> } urls **/
        this.urls = [];

        _private.set(this, {
            /** @private { DuplexStream } _pStream **/
            _pStream: new PassthroughStream(),

            /** @private { EventEmitter } _eventEmitter **/
            _eventEmitter: new EventEmitter(),

            /** @private { Function } _pipeChunks **/
            _pipeChunks: pipeChunks
        });

        this.parser.on('finish', (file) => {
            this.urls = [...file.segments];
            _private.get(this)._pipeChunks.call(this, file.segments);
        });

    }

    on(event, cb) {
        return _private.get(this)._eventEmitter.on(event, cb);
    }

    pipe(stream) {
        _private.get(this)._pStream.pipe(stream);
    }
}

/**
 * @private
 *
 * Downloads a file and pipe its chunks.
 * @param urls
 * @returns {*}
 */
function pipeChunks(urls) {
    const url = urls.shift();
    const pStream = _private.get(this)._pStream;
    const req = request(url.href);

    console.log(`${this.urls.length - urls.length} / ${this.urls.length} complete`);
    req.on('response', (res) => {
        res.pipe(pStream, {end: false});
        res.on('end', () => {
            if(urls.length > 0){
                _private.get(this)._pipeChunks.call(this, urls);
            } else {
                pStream.end(null, null, () => {
                    console.log('Done!');
                    _private.get(this)._eventEmitter.emit('finish', Buffer.concat(pStream.body))
                });

            }
        });
    });

    return req.end();
}

module.exports = M3U8Downloader;