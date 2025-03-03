const fs = require('node:fs');

const width = process.argv[2];
const height = process.argv[3];
const output = process.argv[4];
const base = process.argv.length > 5 ? process.argv[5] : '.';

let stream = fs.createWriteStream(output, {flags:'w'});

for (let i = 0; i < height; i++) {
  for (let j = 0; j < width; j++) {
    stream.write(base);
    stream.write(' ');
  }
  stream.write('\n');
}

stream.end();
