const charMapping = [' ', '.', 'o', '+', '=', '*', 'B', 'O', 'X', '@', '%', '&', '#', '/', '^'];

export function handler(fingerprint: string): string[] {
  // console.error(fingerprint);

  const results = ['+---[CODINGAME]---+'];
  const chunkSize = 2;

  const exas = fingerprint.split(':');
  // console.error(exas);

  const exa2bins = exas.map((exa) => parseInt(exa, 16).toString(2).padStart(8, '0').split(''));
  // console.error(exa2bins);

  const bins = exa2bins
    .map((bin) =>
      Array(Math.ceil(bin.length / chunkSize))
        .fill(1)
        .map((_, index) => index * chunkSize)
        .map((begin) => bin.slice(begin, begin + chunkSize))
        .reverse(),
    )
    .flat()
    .map((bin) => bin.join(''));

  // console.error(bins);

  const maxX = 17;
  const maxY = 9;
  const board: number[][] = [...Array(maxX)].map((_) => Array(maxY).fill(0));

  const bishopStartX = 8;
  const bishopStartY = 4;

  let bishopX = bishopStartX;
  let bishopY = bishopStartY;

  // console.error(board);

  bins.forEach((bin) => {
    switch (bin) {
      case '00':
        bishopX = Math.max(bishopX - 1, 0);
        bishopY = Math.max(bishopY - 1, 0);
        break;

      case '01':
        bishopX = Math.min(bishopX + 1, maxX - 1);
        bishopY = Math.max(bishopY - 1, 0);
        break;

      case '10':
        bishopX = Math.max(bishopX - 1, 0);
        bishopY = Math.min(bishopY + 1, maxY - 1);
        break;

      case '11':
        bishopX = Math.min(bishopX + 1, maxX - 1);
        bishopY = Math.min(bishopY + 1, maxY - 1);
        break;
    }

    // console.error(`[${bin}] => (${bishopX},${bishopY})`);

    board[bishopX][bishopY]++;
  });

  // console.error(board);

  const tranpose = board[0].map((_, colIndex) => board.map((row) => row[colIndex]));

  // console.error(tranpose);

  results.push(
    ...tranpose.map(
      (row, y) =>
        `|${row
          .map((cell, x) => {
            if (x === bishopStartX && y === bishopStartY) {
              return 'S';
            }
            if (x === bishopX && y === bishopY) {
              return 'E';
            }
            return charMapping[cell % charMapping.length];
          })
          .join('')}|`,
    ),
  );
  results.push('+-----------------+');

  // console.error(results);

  return results;
}
