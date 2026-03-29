# Solve a CodinGame Puzzle

Solve a puzzle from codingame.com following the repository conventions.

## Steps

1. **Find the puzzle** in `data/puzzles.json` by name or prettyId
2. **Fetch the statement** by reading the puzzle's `detailsPageUrl` on codingame.com, or ask the user to paste it
3. **Discuss the approach** — algorithm choice, time complexity, edge cases
4. **Implement the solution** following the handler pattern:
   - `src/<level>/<prettyId>/handler.ts` — pure logic, no I/O
   - `src/<level>/<prettyId>/index.ts` — CodinGame readline/console.log glue
   - `src/<level>/<prettyId>/handler.test.ts` — tests if examples are available
5. **Commit** with `feat(<prettyId>): :sparkles: solve puzzle`
6. **Update the README** by running `npm run script:readme`

## Language choice

- Default: TypeScript
- If the user requests Rust, or if TS is too slow: create `main.rs` alongside the TS solution

## Notes

- The level directories are: 00-tutorial, 01-easy, 02-medium, 03-hard, 04-expert, 05-optim, 06-multi, 07-codegolf-easy, etc.
- The `prettyId` is the kebab-case slug used by CodinGame (e.g., `temperatures`, `power-of-thor-episode-1`)
- Solutions cannot be submitted via API — the user must paste them into the CodinGame web IDE
