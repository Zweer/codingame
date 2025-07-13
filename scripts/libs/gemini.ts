import type { Puzzle } from '../types';

import { GoogleGenAI } from '@google/genai';

export class Gemini {
  static PUZZLE_SOLVE_PROMPT = `Solve the following CodinGame puzzle in TypeScript.

Puzzle: {TITLE}

Description:
\`\`\`
{STATEMENT}
\`\`\`

Your response should be a markdown containing two parts: your reasoning and the code.
The code should be in a single TypeScript code block.
Please provide the full code, do not use placeholders.`;

  private readonly genAI: GoogleGenAI;
  private readonly model: string;

  constructor(usePro: boolean) {
    this.genAI = new GoogleGenAI({});
    this.model = `gemini-2.5-${usePro ? 'pro' : 'flash'}`;
  }

  async solvePuzzle(
    puzzle: Puzzle,
    statement: string,
  ): Promise<{ solutionCode: string; reasoning: string } | { error: string }> {
    const contents = Gemini.PUZZLE_SOLVE_PROMPT.replace('{TITLE}', puzzle.title).replace(
      '{STATEMENT}',
      statement,
    );

    console.log('Generating solution with Gemini...');
    const result = await this.genAI.models.generateContent({ contents, model: this.model });
    const response = result.text!;
    console.log('Solution generated.');

    const codeBlockRegex = /```typescript\n([\s\S]*?)\n```/;
    const codeMatch = codeBlockRegex.exec(response);

    if (!codeMatch || !codeMatch[1]) {
      return { error: response };
    }

    const solutionCode = codeMatch[1].trim();
    const reasoning = response.replace(codeBlockRegex, '').trim();

    return { solutionCode, reasoning };
  }
}
