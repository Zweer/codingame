/* eslint-disable no-param-reassign */
const abbreviations: Record<string, string> = {
  sp: ' ',
  bS: '\\',
  sQ: "'",
  nl: '\n',
};

export function handler(input: string): string {
  const chunks = input.split(' ');
  const outputs = chunks.map((chunk) => {
    let what: string;

    const last2chars = chunk.slice(-2);
    if (Object.keys(abbreviations).includes(last2chars)) {
      what = abbreviations[last2chars];
      chunk = chunk.slice(0, -2);
    } else {
      what = chunk.slice(-1);
      chunk = chunk.slice(0, -1);
    }

    const count = parseInt(chunk, 10) || 1;
    const ret = ''.padStart(count, what);

    return ret;
  });

  return outputs.join('');
}
