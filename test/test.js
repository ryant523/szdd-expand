'use strict';

const assert = require('assert');
const fs = require('fs');
const SzddExpandStream = require('../index');
const ncp = require('ncp');


describe('SzddExpandStream', () => {
    let actualFileBuffer;
    let wrongFileBuffer;

    let actualLargeFileBuffer;

    before(function() {
        actualFileBuffer = Buffer.from(fs.readFileSync('test/test1_actual.txt'));
        wrongFileBuffer = Buffer.from(fs.readFileSync('test/test.js'));
        actualLargeFileBuffer = Buffer.from(fs.readFileSync('test/test2_actual.txt'))
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
    it('should work for large files', (done) => {
        let output = Buffer.alloc(0);
        fs.createReadStream('test/test2.txt')
            .pipe(new SzddExpandStream())
            .on('data', data => {
                output = Buffer.concat([output, data]);
            })
            .on('end', () => {
                assert.strictEqual(Buffer.compare(output, actualLargeFileBuffer), 0);
                done();
            });
    });
    it('should work with ncp', (done) => {
        ncp('./test/test2.txt', './test/delete.txt', {
            transform: (read, write, file) => {
                read.pipe(new SzddExpandStream()).pipe(write);
            }
        }, (err) => {
            const expandedFile = fs.readFileSync('./test/delete.txt');
            fs.unlink('./test/delete.txt', (err) => {
                assert.strictEqual(Buffer.compare(expandedFile, actualLargeFileBuffer), 0);
                done()
            });
        });
    });
});