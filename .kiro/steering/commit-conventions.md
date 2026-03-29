# Commit Conventions

**IMPORTANT**: The agent CAN commit directly in this repo. No review/PR process needed.

## Format

Use conventional commits with gitmoji as text (not emoji):

```
type(scope): :emoji_code: short description

Detailed explanation of what changed and why.
```

## Types

- `feat` — New feature / new puzzle solution (`:sparkles:`)
- `fix` — Bug fix (`:bug:`)
- `refactor` — Code refactoring (`:recycle:`)
- `chore` — Maintenance tasks (`:wrench:`, `:arrow_up:`)
- `ci` — CI/CD changes (`:construction_worker:`)
- `docs` — Documentation (`:memo:`)

## Scope

Use the puzzle `prettyId` as scope for puzzle-related commits (e.g., `feat(temperatures): :sparkles: solve puzzle`).

Use general scopes for infrastructure: `tooling`, `scripts`, `ci`, `kiro`.

## Gitmoji

**Always use text codes** (`:sparkles:`), **never actual emoji** (✨).

## Body

**Always include a detailed body** explaining what was changed and why.
