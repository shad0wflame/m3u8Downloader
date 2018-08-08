const EventEmitter = require('events');
const { request }  = require('https');
const { URL } = require('url');

let _private = new WeakMap();
// TODO: implement decrypt method
class M38UParser {

    constructor(url) {

        this.url = url;

        this.file = {
            content: '',
            metadata: [],
            segments: []
        };

        _private.set(this, {
            /** @private { Function } _parseFile **/
            _parseFile: parseFile,

            /** @private { Function } _pathnameExtractor **/
            _pathnameExtractor: pathnameExtractor,

            /** @private { Function } _isURL **/
            _isURL: isURL,

            /** @private { EventEmitter } _eventEmitter **/
            _eventEmitter: new EventEmitter()
        });

        request(url.href, res => {
           res.on('data', chunk => {
               this.file.content += chunk.toString();
           });

           res.on('end', () => _private.get(this)._parseFile.call(this));
        }).end();
    }

    on(event, cb) {
        return _private.get(this)._eventEmitter.on(event, cb);
    }
}

/**
 * @private
 *
 * Parses a m3u8 file.
 * @returns void
 */
function parseFile() {
    const segmentedPathname = pathnameExtractor(this.url.pathname);
    this.file.content.split('\n').forEach(line => {
        if (line !== '') {

            if (line.startsWith('#')) {

                this.file.metadata.push(line);

            } else {

                const segmentedLine = pathnameExtractor(line);

                if (segmentedLine.length > 0) {
                    if (isURL(line)) {
                        this.file.segments.push(new URL(line));
                    } else {
                        if (line.startsWith('/')) {
                            line = line.slice(1);
                        }

                        this.file.segments.push(new URL(`${this.url.origin}/${line}`));
                    }
                } else {
                    this.file.segments.push(new URL(`${this.url.origin}/${segmentedPathname.join('/')}/${line}`));
                }

            }

        }
    });

    _private.get(this)._eventEmitter.emit('finish', this.file);
}

/**
 * @private
 *
 * Extracts a pathname.
 * @param url
 * @returns string[]
 */
function pathnameExtractor(url) {
    return url.split('/').slice(1, -1);
}

/**
 * @private
 *
 * Tests if the text is in URL format.
 * @param text
 * @returns boolean
 */
function isURL(text) {
    let regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    return regexp.test(text);
}


module.exports = M38UParser;