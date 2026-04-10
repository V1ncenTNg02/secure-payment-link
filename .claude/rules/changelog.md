---
paths:
  - "**/*.ts"
  - "**/*.js"
  - "**/*.vue"
  - "**/*.sql"
  - "**/*.json"
---

# Changelog Enforcement Rule

## MANDATORY: Update .claude/changelog/changelog.md After Every Code Change

Whenever you modify, create, or delete any source file, you MUST append an entry to
`.claude/changelog/changelog.md` before considering the task complete.

**This rule is non-negotiable. Do not skip it, even for small changes.**

## Entry Format

Each entry must follow this exact structure:

```markdown
### [Change Name]
- **Time:** YYYY-MM-DDTHH:MM:SS (use current UTC time)
- **Type:** `feat` | `fix` | `refactor` | `migration` | `test` | `docs` | `chore`
- **Summary:**
  - **Before:** [What the old logic/state was. Write "N/A" for new files.]
  - **After:** [What the new logic/state is. Be specific about what changed and why.]
```

## Change Type Definitions
| Type | When to use |
|------|-------------|
| `feat` | New feature or user-visible behaviour added |
| `fix` | Bug fix — correcting unintended behaviour |
| `refactor` | Internal restructuring without changing behaviour |
| `migration` | Database migration file added |
| `test` | Test added or modified |
| `docs` | Documentation, README, BRD, DECISIONS, comments |
| `chore` | Config, tooling, dependency changes |

## What "Before vs After" Means
- For a **new file**: Before = "File did not exist", After = what it introduces
- For a **modified file**: Before = the specific logic that was replaced, After = the new logic
- For a **deleted file**: Before = what it did, After = "Removed — [reason]"
- Always describe **why** the change was made, not just what changed

## Workflow
1. Make your code change
2. Immediately open `.claude/changelog/changelog.md`
3. Prepend a new entry under `## Changes` (newest first)
4. Save the file
5. Only then proceed to the next task or commit
