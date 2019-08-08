'use strict';

// https://www.cabextract.org.uk/libmspack/doc/szdd_kwaj_format.html

const stream = require('stream');

const WINDOW_SIZE = 4096;
const SZDD_SIGNATURE = Buffer.from([0x53, 0x5A, 0x44, 0x44, 0x88, 0xF0, 0x27, 0x33]);

class SzddExpandStream extends stream.Transform {

    constructor() {
        super();
    }

    _transform(chunk, encoding, callback) {

        if (!this.type) {
            chunk = this._setType(chunk);
        }

        if (this.type === 'SZDD') {
            let returnBuffer = [];
            let i = 0;
            while(i < chunk.length) {
                let control = chunk[i++];

                for (let cbit = 0x01; cbit & 0xFF && i < chunk.length; cbit <<= 1) {
                    if (control & cbit) {
                        returnBuffer.push(chunk[i]);
                        this.window[this.pos++] = chunk[i++];
                        this.pos &= WINDOW_SIZE - 1;
                    } else {
                        let matchpos = chunk[i++];
                        let matchlen = chunk[i++];
                        matchpos |= (matchlen & 0xF0) << 4;
                        matchlen = (matchlen & 0x0F) + 3;
                        while (matchlen--) {
                            returnBuffer.push(this.window[matchpos]);
                            this.window[this.pos++] = this.window[matchpos++];
                            this.pos &= WINDOW_SIZE - 1;
                            matchpos &= WINDOW_SIZE - 1;
                        }
                    }
                }
            }

            if (returnBuffer.length > 0) {
                this.push(Buffer.from(returnBuffer));
            }
        } else {
            this.push(chunk);
        }

        return callback();
    }

    _setType(chunk) {
        if (chunk.slice(0, 8).compare(SZDD_SIGNATURE) === 0) {
            this.type = 'SZDD';
            this.window = new Array(WINDOW_SIZE);
            this.window.fill(0x20);
            this.pos = WINDOW_SIZE - 16;
            this.header = chunk.slice(0, 14);
            chunk = chunk.slice(14);
        } else {
            this.type = 'REGULAR';
        }
        return chunk;
    }
}

module.exports = SzddExpandStream;