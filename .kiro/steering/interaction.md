# Interaction Patterns

## Interview Before Implementing

For ambiguous or complex requests, ask clarifying questions BEFORE writing code:
- What's the expected behavior?
- Are there edge cases to consider?
- Does this affect existing features?
- What's the priority (quick fix vs proper solution)?

Skip the interview for clear, well-defined tasks.

## Plan Mode

For multi-step tasks (new features, refactors, architecture changes):
1. Write a short numbered plan first
2. Wait for approval before implementing
3. Adapt the plan if requirements change mid-execution

Skip planning for single-file fixes, small bug fixes, or simple questions.

## Git Rules

- **NEVER commit automatically.** Only commit when the user explicitly asks to commit.
- When the user asks to commit, use conventional commits with gitmoji (see commit-conventions.md)
- Use `git add -A` before committing to include all changes
- Do NOT push unless explicitly asked
