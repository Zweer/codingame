/**
 * Auto-generated code below aims at helping you parse
 * the standard input according to the problem statement.
 */

const MESSAGE = readline();

function pad(n, width, z) {
  z = z || '0';
  n = `${n}`;
  return n.length >= width ? n : Array.from({ length: width - n.length + 1 }).join(z) + n;
}

function dec2bin(dec) {
  return (dec >>> 0).toString(2);
}

function char2bin(char) {
  return pad(char.charCodeAt(0).toString(2), 7);
}

function aggr2cn(bit, count) {
  const ret = [];

  ret[0] = bit === '0' ? '00' : '0';

  ret[1] = [];
  for (let i = 0; i < count; ++i) {
    ret[1] += '0';
  }

  return ret.join(' ');
}

function message2cn(message) {
  printErr(message);

  let bin = [];
  for (let i = 0, l = message.length; i < l; ++i) {
    bin.push(char2bin(message[i]));
  }

  bin = bin.join('');
  printErr(bin);

  const ret = [];
  let oldChar;
  let count;
  for (let j = 0, bl = bin.length; j < bl; ++j) {
    if (oldChar !== bin[j]) {
      if (j !== 0) {
        printErr(aggr2cn(oldChar, count));
        ret.push(aggr2cn(oldChar, count));
      }

      oldChar = bin[j];
      count = 0;
    }

    count++;
  }

  ret.push(aggr2cn(oldChar, count));

  return ret.join(' ');
}

// Write an action using print()
// To debug: printErr('Debug messages...');

// print('00 0 0 0 00 00 0 0 00 0 0 0');

print(message2cn(MESSAGE));
