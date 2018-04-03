const { request }  = require('https');
const EventEmitter = require('events');
const DuplexStream = require('./duplex-stream');

let _private = new WeakMap();

class M3U8Downloader {

    constructor(urls) {

        /** { Array<URL> } urls **/
        this.urls = [...urls];

        _private.set(this, {
            /** @private { DuplexStream } _dStream **/
            _dStream: new DuplexStream(),

            /** @private { EventEmitter } _eventEmitter **/
            _eventEmitter: new EventEmitter(),

            /** @private { Function } _pipeChunks **/
            _pipeChunks: pipeChunks
        });

        _private.get(this)._pipeChunks.call(this, urls);
    }

    on(event, cb) {
        return _private.get(this)._eventEmitter.on(event, cb);
    }

    pipe(stream) {
        _private.get(this)._dStream.pipe(stream);
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
    const dStream = _private.get(this)._dStream;
    const req = request(url.href, res => {

        res.on('data', (chunk) => {
            dStream.write(chunk);
        });

        res.on('end', () => {
            console.log(`${this.urls.length - urls.length} / ${this.urls.length} complete`);
            if(urls.length > 0){
                _private.get(this)._pipeChunks.call(this, urls);
            } else {
                console.log('Done!');
                dStream.end(null, null, dStream.stop());
                _private.get(this)._eventEmitter.emit('finish', Buffer.concat(dStream.body));
            }
        });
    });

    return req.end();
}

module.exports = M3U8Downloader;