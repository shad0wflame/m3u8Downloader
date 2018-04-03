const { Duplex } = require('stream');

let _private = new WeakMap();

class DuplexStream extends Duplex {

    constructor(options) {
        super(options);

        /** { Array<Buffer> } body **/
        this.body = [];

        _private.set(this, {
            /** @private { Array<Buffer> } _buffer **/
            _buffer: [],

            /** @private { boolean } _continue **/
            _continue: true
        });

    }

    _write(chunk, encoding, callback) {
        process.nextTick(() => {
            this.body.push(chunk);
            _private.get(this)._buffer.push(chunk);
            callback();
        });
    }

    _read() {
        const buffer = _private.get(this)._buffer;
        process.nextTick(() => {
            while(buffer.length) {
                this.push(buffer.shift());
            }

            if (_private.get(this)._continue) {
                setTimeout(() => this._read());
            }
        });
    }

    stop() {
        _private.get(this)._continue = false;
    }

}

module.exports = DuplexStream;