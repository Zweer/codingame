# Testing Strategy

## Test Framework

### Vitest
- All tests use **Vitest**
- Configuration in `vitest.config.ts` (if needed) or inline in `package.json`

## Test Structure

Tests live alongside the puzzle solution:

```
src/<level>/<prettyId>/
├── handler.ts
├── handler.test.ts    # Tests for this puzzle
└── index.ts
```

### Test Pattern
```typescript
import { describe, expect, it } from 'vitest';

import { solve } from './handler.js';

describe('puzzle-name', () => {
  it('should handle basic case', () => {
    expect(solve([1, -2, 3])).toBe(1);
  });

  it('should handle empty input', () => {
    expect(solve([])).toBe(0);
  });
});
```

## When to Write Tests

- When the puzzle statement provides clear input/output examples
- When the logic is complex enough to benefit from regression testing
- Tests are NOT required for every puzzle — use judgment

## When NOT to Write Tests

- Interactive/game-loop puzzles (multi-player, optimization)
- Puzzles where I/O parsing is the main complexity
- Auto-generated Gemini solutions (unless manually reviewed)
