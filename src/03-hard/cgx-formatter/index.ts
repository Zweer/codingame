const N = Number(readline());
let raw = '';
for (let i = 0; i < N; i++) raw += readline();

// Tokenize
const tokens: string[] = [];
let i = 0;
while (i < raw.length) {
  const c = raw[i];
  if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }
  if (c === "'") {
    let j = i + 1;
    while (j < raw.length && raw[j] !== "'") j++;
    tokens.push(raw.substring(i, j + 1));
    i = j + 1;
  } else if ('()=;'.includes(c)) {
    tokens.push(c);
    i++;
  } else {
    let j = i;
    while (j < raw.length && !" \t\n\r'()=;".includes(raw[j])) j++;
    tokens.push(raw.substring(i, j));
    i = j;
  }
}

// Format
const lines: string[] = [];
let indent = 0;
let t = 0;
while (t < tokens.length) {
  const tok = tokens[t];
  if (tok === '(') {
    lines.push(' '.repeat(indent) + '(');
    indent += 4;
    t++;
  } else if (tok === ')') {
    indent -= 4;
    // Attach ; if next token is ;
    if (t + 1 < tokens.length && tokens[t + 1] === ';') {
      lines.push(' '.repeat(indent) + ');');
      t += 2;
    } else {
      lines.push(' '.repeat(indent) + ')');
      t++;
    }
  } else if (t + 1 < tokens.length && tokens[t + 1] === '=') {
    // KEY=VALUE
    const key = tok;
    t += 2; // skip key and =
    if (t < tokens.length && tokens[t] === '(') {
      // value is a block → key= on its own line, block starts next
      lines.push(' '.repeat(indent) + key + '=');
    } else if (t < tokens.length) {
      // value is primitive
      let line = key + '=' + tokens[t];
      t++;
      if (t < tokens.length && tokens[t] === ';') {
        line += ';';
        t++;
      }
      lines.push(' '.repeat(indent) + line);
    }
  } else {
    // Primitive on its own
    let line = tok;
    t++;
    if (t < tokens.length && tokens[t] === ';') {
      line += ';';
      t++;
    }
    lines.push(' '.repeat(indent) + line);
  }
}

console.log(lines.join('\n'));
