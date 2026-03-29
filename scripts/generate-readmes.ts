import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { NodeHtmlMarkdown } from 'node-html-markdown';

import { puzzlesFilepath } from './constants.js';
import { CodinGame } from './libs/codingame.js';
import type { Puzzle } from './types.js';

const codingame = new CodinGame();
const srcPath = join(__dirname, '..', 'src');

function flattenTopics(topics: Puzzle['topics']): string[] {
  return topics.flatMap((t) => [
    ...(t.children.length > 0 ? t.children.map((c) => c.value) : [t.value]),
  ]);
}

function buildReadme(puzzle: Puzzle, statementMd: string): string {
  const url = `https://www.codingame.com${puzzle.detailsPageUrl}`;
  const topics = flattenTopics(puzzle.topics);
  const topicsLine = topics.length > 0 ? `**Topics:** ${topics.join(', ')}\n` : '';

  return `# ${puzzle.title}

[:link: Puzzle on CodinGame](${url})

**Level:** ${puzzle.level}
${topicsLine}
${statementMd.trim()}
`;
}

async function main(): Promise<void> {
  const puzzles: Puzzle[] = JSON.parse(readFileSync(puzzlesFilepath, 'utf8'));
  const puzzlesByPrettyId = new Map(puzzles.map((p) => [p.prettyId, p]));

  const levelDirs = readdirSync(srcPath).filter((d) =>
    existsSync(join(srcPath, d)) && !d.startsWith('.')
  );

  const solvedPuzzles: { prettyId: string; dir: string }[] = [];
  for (const levelDir of levelDirs) {
    const levelPath = join(srcPath, levelDir);
    try {
      for (const prettyId of readdirSync(levelPath)) {
        const puzzlePath = join(levelPath, prettyId);
        if (existsSync(join(puzzlePath, 'index.ts')) || existsSync(join(puzzlePath, 'main.rs'))) {
          solvedPuzzles.push({ prettyId, dir: join(levelPath, prettyId) });
        }
      }
    } catch {
      continue;
    }
  }

  console.log(`Found ${solvedPuzzles.length} solved puzzles.`);

  let generated = 0;
  let skipped = 0;

  for (const { prettyId, dir } of solvedPuzzles) {
    const readmePath = join(dir, 'README.md');
    if (existsSync(readmePath)) {
      skipped++;
      continue;
    }

    const puzzle = puzzlesByPrettyId.get(prettyId);
    if (!puzzle) {
      console.warn(`Puzzle not found in database: ${prettyId}`);
      continue;
    }

    try {
      const { statement } = await codingame.findProgressByPrettyId(prettyId);
      if (!statement) {
        console.warn(`No statement for: ${prettyId}`);
        continue;
      }

      const statementMd = NodeHtmlMarkdown.translate(statement);
      const readme = buildReadme(puzzle, statementMd);
      writeFileSync(readmePath, readme);
      generated++;
      console.log(`✓ ${prettyId}`);
    } catch (error) {
      console.error(`✗ ${prettyId}: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log(`\nDone: ${generated} generated, ${skipped} skipped (already exist).`);
}

void main();
