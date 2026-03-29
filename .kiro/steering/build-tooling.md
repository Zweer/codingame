# Build & Tooling

## Linting & Formatting

### Biome
- **Biome** for linting and formatting (NOT ESLint/Prettier)
- Single quotes, 100 line width
- Uses `.editorconfig` for indent settings
- Import sorting with grouped blank lines

### Commands
```bash
npm run lint               # Biome check + fix
npm run lint:typecheck     # TypeScript check (tsc --noEmit)
```

## TypeScript
- `tsx` for running TypeScript scripts directly
- `tsc` only for type-checking (`tsc --noEmit`), never for building
- `tsconfig.json` extends `@tsconfig/node22`

## Testing

### Vitest
- All tests use **Vitest**
- Run with `npm test`
- Tests are optional per puzzle — only add when test cases are available

## Package Manager

### npm
- Use **npm** (NOT pnpm or yarn)
- Lock file: `package-lock.json`

## Scripts

| Script | Description |
|--------|-------------|
| `npm run lint` | Biome check + fix |
| `npm test` | Run tests with vitest |
| `npm run script:retrieve` | Fetch puzzle list from CodinGame API |
| `npm run script:readme` | Update README with solved/unsolved status |
| `npm run script:solve` | Auto-solve puzzles with Gemini |
