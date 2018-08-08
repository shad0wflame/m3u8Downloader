const { Transform } = require('stream');

class PassthroughStream extends Transform {

    constructor(options) {
        super(options);

        /** { Array<Buffer> } body **/
        this.body = [];

    }

    _transform(chunk, encoding, callback) {
        this.body.push(chunk);
        callback(null, chunk);
    }

}

module.exports = PassthroughStream;