'use strict';

const assert = require('assert');
const fs = require('fs');
const SzddExpandStream = require('../index');


describe('SzddExpandStream', () => {
    let actualFileBuffer;
    let wrongFileBuffer;

    before(function() {
        fs.readFile('test/test1_actual.txt', (err, contents) => {
            actualFileBuffer = contents;
        });
        fs.readFile('test/test.js', (err, contents) => {
            wrongFileBuffer = contents;
        });
    });
    it('should expand file if in Szdd format', () => {
        let output = Buffer.alloc(0);
        fs.createReadStream('test/test1_compress.txt')
            .pipe(new SzddExpandStream())
            .on('data', data => {
                output = Buffer.concat([output, data]);
            })
            .on('end', () => {
                assert.strictEqual(Buffer.compare(output, actualFileBuffer), 0);
                assert(Buffer.compare(output, wrongFileBuffer) !== 0);
            });
    });
    it('should not modify file if not Szdd format', () => {
        let output = Buffer.alloc(0);
        fs.createReadStream('test/test1_actual.txt')
            .pipe(new SzddExpandStream())
            .on('data', data => {
                output = Buffer.concat([output, data]);
            })
            .on('end', () => {
                assert.strictEqual(Buffer.compare(output, actualFileBuffer), 0);
            });
    });
});