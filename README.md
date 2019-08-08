# svdd-expand

Expand compressed files in SVDD format using streams.
If file is not in the svdd format then the file is not modified.

https://www.cabextract.org.uk/libmspack/doc/szdd_kwaj_format.html

## Usage

```javascript
const fs = require('fs');
const SvddTransformStream = require('svdd-expand');

fs.createReadStream('./sample.txt')
    .pipe(new SvddTransformStream())
    .pipe(fs.createWriteStream('./output.txt'));
````

This transform stream can be used directly with ncp when copying directories.

```javascript
const npc = require('ncp');
const SvddTransformStream = require('svdd-expand');

ncp(sourceFolder, destinationFolder, {
    transform: (read, write, file) => {
        read.pipe(new SvddTransformStream()).pipe(write);
    }
}, (err) => {
    console.log(done);
});
```
