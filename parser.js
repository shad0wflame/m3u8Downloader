const { request }  = require('https');
const { URL } = require('url');

let _private = new WeakMap();
// TODO: set private methods
// TODO: implement decrypt method
class M38UParser {

    constructor(url) {

        this.url = url;

        this.file = {
            content: '',
            metadata: [],
            segments: []
        };

        const req = request(url.href, res => {
           res.on('data', chunk => {
               this.file.content += chunk.toString();
           });

           res.on('end', () => this.parseFile());
        });

        req.end();
    }

    parseFile() {
        const segmentedPathname = this.pathnameExtractor(this.url.pathname);
        this.file.content.split('\n').forEach(line => {
            if (line !== '') {

                if (line.startsWith('#')) {

                    this.file.metadata.push(line);

                } else {

                    const segmentedLine = this.pathnameExtractor(line);

                    if (segmentedLine.length > 0) {
                        if (this.isURL(line)) {
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
    }

    pathnameExtractor(url) {
        return url.split('/').slice(1, -1);
    }

    isURL(text) {
        let regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
        return regexp.test(text);
    }

}

module.exports = M38UParser;