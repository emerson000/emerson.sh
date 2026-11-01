---
title: "One memory for two coding agents"
description: "fact-store: one shared SQLite memory for Claude Code and Codex, with trust scores, budgeted hook injection and agents that save facts unprompted."
date: 2026-10-24
pillar: ai
tags: [agents, claude-code, codex, mcp, sqlite, memory]
layout: standard
toc: true
---

I use two coding agents every day: Claude Code and Codex. Both are good. Both forget everything when a session ends. Each one keeps its own memory, in its own format, and the two never share it.

So I kept repeating myself. Which package manager I use. Which machine runs what. Why we chose one library over another. Which error message means which fix. A fact that one agent learned on Tuesday was gone for the other agent on Wednesday.

On 16 October I designed and built **fact-store** to fix this. It gives both agents one shared, durable memory. This post covers the design, the trust model, how facts get into a session, what the agents saved in the first week, and what went wrong.

## What success looks like

I wrote three success criteria before any code:

- A fact learned in a Codex session shows up in the next Claude Code session, and the other way round.
- I rarely have to repeat a preference or an environment detail.
- Injected context stays small and relevant. It does not flood the prompt.

I also wrote **anti-goals**: things that count as failure even if the code works. A hook that slows down or breaks a session. Context flooding. Low-trust or expired facts shown as truth. A reminder that loops. An install script that damages my existing agent settings. These turned out to be more useful than the goals, because each one became a test.

## Decisions I made, and decisions I delegated

The design document has a table of decisions I made myself: Python packaged with uv, one global database, an MCP server plus a command-line tool, three hooks, the global instruction files for both agents, and the four inputs to trust. MCP is the Model Context Protocol, the standard way to give an agent extra tools.

Everything else is marked "my call" by the model that wrote the design: the schema, the trust numbers, the ranking formula, the dedupe threshold, the token budgets. That split mattered. I could review the builder's calls quickly because they were labeled, and every number ended up in a config file I can change.

## Architecture

fact-store is one SQLite database, a Python package, and two thin adapters.

| Part | What it does |
|---|---|
| SQLite database | One file, shared by both agents. WAL mode and a busy timeout let hooks and MCP calls from both agents write at the same time. |
| FTS5 index | Full-text search over each fact's content and tags, kept in sync by triggers. |
| MCP server | Tools for the agents: add, search, get, update, confirm, dispute, delete, and list or add categories. Registered once per agent, so it knows which agent is calling. |
| CLI | The same operations for me and for hooks: add, search, edit, export, a preview of what would be injected, and stats. |
| Hooks | Small commands that each agent runs at fixed moments in a session. |

A fact is one short sentence with a **category**, optional tags, a **source**, a **trust score**, and a scope. The scope is either global or one project. The project is the git root of the agent's working directory, so facts about one repo don't leak into another.

Categories live in a small registry. Seven are seeded: preferences, environment, project, decisions, gotchas, people and reference. Three of them (preferences, environment, project) are flagged for automatic injection at session start. The rest come back only when a prompt matches them.

> [!WARNING]
> Don't put a SQLite database in WAL mode inside a synced folder such as Nextcloud or Dropbox. File sync can corrupt it. fact-store keeps its database under `~/.local/share` and uses an export command for backups.

## Trust scoring

Agents are often wrong, and so are notes. A shared memory that treats every line as truth would spread mistakes from one agent to the other. So every fact has a trust score from 0 to 1, and every change to it is written to an audit table.

| Event | Effect on trust `t` |
|---|---|
| Created by the user | starts at 0.90 |
| Created and verified with a tool | starts at 0.75 |
| Created by inference | starts at 0.50 |
| Marked tentative | starting value × 0.6 |
| Reinforced (a near-duplicate saved again) | `t += 0.10 × (1 − t)`, or 0.20 if a different agent or session saves it |
| Confirmed | `t += 0.30 × (1 − t)` |
| Disputed | `t −= 0.40 × t` |
| Superseded by a newer fact | `t × 0.2`, and the fact is retired |
| Age | after 90 days without confirmation, trust halves every 180 days |

Age decay is calculated when a fact is read, never stored. Preferences don't decay. The trust score has three uses: it weights search ranking, it sets a floor (0.40) for automatic injection, and it is printed next to every injected fact so the agent can judge it.

A worked example shows how the numbers behave. An agent infers a fact: 0.50. Another session confirms it: 0.65. Later an agent finds it wrong and disputes it: 0.39. One dispute after one confirmation drops it below the injection floor. The fact still exists and can still be found by search, but it stops being pushed into new sessions. Then the agent saves the correct version with `supersedes`, and the old one is retired.

Search ranking combines three things: the full-text relevance score (BM25), the trust score, and a 1.5× boost for facts in the current project.

```text
score = relevance × (0.5 + effective_trust) × project_boost
```

The `0.5 +` matters. A low-trust fact that matches a prompt very well can still rank. It just needs a much better match than a trusted one.

## Getting facts into the session with hooks

Both Claude Code and Codex can run hooks: commands that run at fixed moments and can add text to the agent's context. fact-store uses three.

| Hook | When | What it injects |
|---|---|---|
| SessionStart | A session opens | Auto-inject categories plus all facts for the current project, trust ≥ 0.40, up to about 1,500 tokens |
| UserPromptSubmit | Each prompt | The top 5 facts that match the prompt, trust ≥ 0.40, up to about 500 tokens. Each fact at most once per session |
| Stop | The agent finishes a turn | About every 5 prompts, if nothing was saved, one reminder to save what it learned |

The injected block is plain text. Each fact carries its id and trust, so the agent can confirm or dispute it by id. These example facts are invented:

```text
<fact-store>
## environment
- [#41 trust 0.82] The docs site builds with `npm run build` and writes to `dist/`
- [#57 trust 0.75] The staging database runs on 198.51.100.20, port 5432
## gotchas
- [#63 trust 0.45 (tentative)] Playwright tests are flaky when run with more workers than CI uses
</fact-store>
```

The prompt hook has to turn arbitrary user text into a full-text query. Prompts are full of quotes, colons, asterisks and code, and FTS5 treats many of those as syntax. So the query is never passed through raw. The builder splits the text into words, drops stopwords and short terms, quotes each term, joins them with `OR`, and stops at 12 terms. If fewer than two usable terms remain, the hook injects nothing.

The hooks follow strict rules from the anti-goals. They target under 200 milliseconds. They always exit with status 0. They catch every error and write it to a log file. They print nothing to standard output except valid hook JSON. The plan required the builder to check the Codex hook contract before writing that side, and it was checked against the JSON schemas shipped in the installed Codex version. Codex rejects unknown output keys, so the hooks print only the keys both agents accept, and nothing at all when there is nothing to inject.

The Stop reminder needed its own care. If the agent is already continuing because of a Stop hook, the hook does nothing. Otherwise a reminder could fire, the agent could reply, and the reminder could fire again.

## Telling agents to save without being asked

Tools alone don't change behavior. The installer writes a marked block into each agent's global instruction file (`~/.claude/CLAUDE.md` and `~/.codex/AGENTS.md`). Running the installer again replaces the block instead of adding a second one. The block tells the agents:

- the memory exists, and injected facts are context, not truth;
- search before assuming anything about me, my machines or a project;
- save durable learnings **immediately and without being asked**: preferences, corrections, environment facts, decisions with reasons, and gotchas;
- one atomic fact per entry, under about 300 characters;
- set `source` honestly: `user` only if I said it, `verified` only if a tool confirmed it;
- confirm or dispute injected facts when they prove right or wrong, and supersede facts that change;
- never store secrets.

## What the agents saved in the first week

From 17 October to 23 October, the agents created 245 facts. I don't show the facts themselves here, because many name my machines and preferences. The counts are enough to show the pattern.

| Category | Facts |
|---|---|
| gotchas | 102 |
| environment | 40 |
| decisions | 36 |
| project | 35 |
| reference | 16 |
| preferences | 12 |
| people | 4 |

Four things stand out.

**Gotchas dominate.** Agents save what hurt them: an error, its cause, and the fix. That is exactly the kind of fact I used to lose between sessions.

**Agents claim verification.** 198 facts were saved as `verified`, 44 as `user` and only 3 as `inferred`. Only 2 were marked tentative. That is either a sign the instructions work or a sign the agents are generous about what counts as verified. Counts alone can't tell me which.

**Corrections happen.** There were 25 supersede events, 8 disputes and 6 confirms. Agents do replace stale facts, and they do it more often than they confirm good ones.

**The split between agents is lopsided.** Claude Code created 237 facts and Codex created 8. I don't yet know how much of that is how much I used each agent that week, and how much is how each one follows the instruction block.

One more thing surprised me. No fact has been reinforced yet. I expected near-duplicates to be common. Either the agents search before they save, or the dedupe rule is stricter than it needs to be. The next section explains why it is strict.

## What went wrong

The design, the plan and the build all happened on 16 October. The core came together in about ten commits. Before I turned it on for real, one last commit fixed five problems.

**Corrections reinforced the fact they were meant to replace.** The dedupe rule said: if a new fact is at least 85% similar to an existing one in the same category and project, reinforce the old fact instead of adding a new one. But "the API listens on port 8080" and "the API listens on port 8081" are more than 85% similar. A correction made the wrong fact more trusted. The fix adds a second test: the two facts must make the same claim. They must have the same numbers, the same negations, and one must contain the other's key words. If not, fact-store saves the new fact and returns a `possible_duplicate_of` hint, and the instruction block tells the agent to supersede or dispute the old one.

**Category names matched prompts.** The full-text index covered the category column. A prompt like "add a reference to the people module" matched facts filed under `people` and `reference`, whatever they said. The query now searches only content and tags.

**One large fact blocked all the others.** Injection stopped at the first fact that did not fit the token budget, so one oversized fact could starve every smaller one after it. Now an oversized fact is skipped, the loop continues, and long facts are cut to 600 characters with a pointer to the full text.

**Reinstalling from a new path added duplicate hooks.** The installer recognized its own hooks by the exact command, including the binary path. After a reinstall from a different path, it saw a stranger and added a second set. It now recognizes its own hooks for that agent at any path and updates them in place.

**The installer reformatted my settings.** It rewrote JSON settings files with its own indentation. It now keeps the file's existing indentation, and uninstall removes files that only the installer created.

None of these were exotic. Each one came from a rule that looked right in the design and broke on a real case. The test suite now covers all five.

## Open questions

- **Secrets.** Automatic secret scrubbing was a non-goal for version 1. The only control is the instruction "never store secrets", and an instruction is not a control I want to rely on for long.
- **Codex usage.** I want to know why Codex saves so few facts before I change anything.
- **Verified versus inferred.** A sample review will tell me whether `verified` means what I want it to mean.
- **One machine only.** The database is local by design. Sharing memory across machines would need a real sync story, not a synced folder.

The main loop works. The end-to-end test saves a fact through the Codex tools and finds it in the next Claude Code session for the same repo, and not in a session for a different repo. That is the whole point: a gotcha one agent hits on Tuesday should be waiting for the other agent on Wednesday.
