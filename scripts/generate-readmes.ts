import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { NodeHtmlMarkdown } from 'node-html-markdown';

import { puzzlesFilepath } from './constants.js';
import { CodinGame } from './libs/codingame.js';
import type { Puzzle } from './types.js';

const codingame = new CodinGame();
const srcPath = join(__dirname, '..', 'src');

function flattenTopics(topics: Puzzle['topics']): string[] {
  return topics.flatMap((t) =>
    t.children.length > 0 ? t.children.map((c) => c.value) : [t.value],
  );
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
  console.log(`Loaded ${puzzles.length} puzzles from database.`);

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const puzzle of puzzles) {
    const levelDir = CodinGame.LEVEL_DIR[puzzle.level];
    if (!levelDir) continue;

    const puzzlePath = join(srcPath, levelDir, puzzle.prettyId);
    const readmePath = join(puzzlePath, 'README.md');

    if (existsSync(readmePath)) {
      skipped++;
      continue;
    }

    try {
      const { statement } = await codingame.findProgressByPrettyId(puzzle.prettyId);
      if (!statement) {
        console.warn(`⚠ No statement for: ${puzzle.prettyId}`);
        errors++;
        continue;
      }

      mkdirSync(puzzlePath, { recursive: true });
      const statementMd = NodeHtmlMarkdown.translate(statement);
      writeFileSync(readmePath, buildReadme(puzzle, statementMd));
      generated++;
      console.log(`✓ ${puzzle.prettyId}`);
    } catch (error) {
      errors++;
      console.error(`✗ ${puzzle.prettyId}: ${error instanceof Error ? error.message : error}`);
    }
  }

  console.log(`\nDone: ${generated} generated, ${skipped} skipped, ${errors} errors.`);
}

void main();
