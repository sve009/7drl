const fs = require('node:fs');

const file = process.argv[2];
const output = process.argv[3];

fs.readFile(file, 'utf8', (err, contents) => {
  if (err) {
    console.log(err);
    return;
  }

  const height = contents.match(/\n/g).length;

  let content = contents.replace(/\s/g, '');
  content = content.replace(/\n/g, '');

  const width = Math.floor(content.length / height);

  let mapArr = [];
  for (let i = 0; i < content.length; i++) {
    const c = content.charAt(i);
    switch (c) {
      case "#": {
        mapArr.push(0);
        break;
      }
      case ".": {
        mapArr.push(1);
        break;
      }
      case "+": {
        mapArr.push(2);
        break;
      }
      case "g": {
        mapArr.push(3);
        break;
      }
      case "a": {
        mapArr.push(6);
        break;
      }
      case "l": {
        mapArr.push(7);
        break;
      }
      case "w": {
        mapArr.push(8);
        break;
      }
      case "-": {
        mapArr.push(9);
        break;
      }
      case "|": {
        mapArr.push(10);
        break;
      }
      case ">": {
        mapArr.push(11);
        break;
      }
      case "<": {
        mapArr.push(12);
        break;
      }
      case "s": {
        mapArr.push(13);
        break;
      }
      case "c": {
        mapArr.push(14);
        break;
      }
      case "x": {
        mapArr.push(15);
        break;
      }
      case "d": {
        mapArr.push(16);
        break;
      }
      case "t": {
        mapArr.push(5);
        break;
      }
      case "A": {
        mapArr.push(17);
        break;
      }
      case "o": {
        mapArr.push(18);
        break;
      }
    }
  }

  const jsonContent = JSON.stringify({ name: output, width, height, gameMap: mapArr });
  fs.writeFile(output, jsonContent, (err) => {
    if (err) {
      console.log(err);
    }
  });
});
