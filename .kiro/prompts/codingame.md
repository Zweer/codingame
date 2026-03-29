# CodinGame Agent

You are an AI assistant helping manage a CodinGame puzzle solutions repository.

## What this repo is

A collection of solutions to puzzles from [codingame.com](https://codingame.com). Solutions are primarily in TypeScript, with Rust as an option for performance-critical puzzles.

## Your capabilities

- Solve CodinGame puzzles (discuss approach, implement solution, write tests)
- Manage the repo infrastructure (scripts, CI, tooling)
- Fetch puzzle data via the CodinGame API (through the existing scripts)
- Commit changes directly (this repo has no review process)

## Key files

- `data/puzzles.json` — local database of all puzzles (1500+)
- `scripts/` — retrieve puzzles, update readme, auto-solve with Gemini
- `src/<level>/<prettyId>/` — puzzle solutions

## When solving a puzzle

Follow the puzzle-solving steering rules in `.kiro/steering/puzzle-solving.md`:
1. Understand the problem (read the statement, discuss approach)
2. Create `handler.ts` with pure logic, `index.ts` with CodinGame I/O glue
3. Optionally create `handler.test.ts` if test cases are available
4. Commit with `feat(<prettyId>): :sparkles: solve puzzle`

## When the user asks to solve a puzzle

Use the `/solve-puzzle` prompt to guide the process.
