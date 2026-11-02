---
title: "Plan, hand off, verify: how I run coding agents on a real product"
description: "The method I use to build Kayori with coding agents: written specs, narrow handoffs, CI-grade verification, and a human at the decision points."
date: 2026-05-16
pillar: ai
tags: [agents, coding-agents, specs, testing, kayori]
layout: standard
toc: true
---

Since March, coding agents have written most of the code in Kayori, the intelligence workstation I am building. Kayori is a Rust application. It has a web console, a worker process that owns the database, and a mesh layer that links nodes. It is meant to become a product, so I can't merge code that I don't understand.

So my work has changed. I write less code and more plans, reviews and decisions. Over two months a method settled in, with three steps: **plan, hand off, verify**. The examples here come from the March and April work.

## The loop in one table

| Step | Who does it | What comes out |
|---|---|---|
| Plan | A planning model reads the repo; I answer its questions | A spec: goals, non-goals, phases, acceptance criteria, open questions |
| Hand off | The planning model, with my review | A delegation plan: workstreams, file lists, dependencies, one prompt per workstream |
| Execute | Coding agents, one workstream each | Commits on a feature branch, plus a report of files changed and commands run |
| Verify | The coding agent, then CI | The full test suite, with the exact commands and results written down |
| Review | A fresh model that did not write the code | A gap review: the spec compared with the branch |
| Decide | Me | Merge, send back, or change the spec |

One model plans and a different one executes. The planner reads widely and thinks about structure. The executor needs a narrow brief and a clear finish line. A reviewer that did not write the code is not attached to it. These are different jobs, so one session does not do all of them.

## Write the spec first, and let the model write it

Every feature starts with a short prompt from me and a long spec from the model. The prompt says what I want and where the spec goes. It does not say how to build it. This is the prompt that started the Postgres work in April, with the paths removed:

```text
Create a concrete spec in <planning folder>/postgres that implements postgres.
The project should support both Sqlite and Postgres. There should be a
documented and straightforward CLI process for migrating an instance from
SQLite to Postgres.

For testing and local dev purposes, we should use something that lets us run
a postgres-like connection locally without running a full postgres server.
```

The spec that comes back has the same sections every time: summary, problem, goals, **non-goals**, how it fits the current architecture, phases with user stories and acceptance criteria, risks, open questions, and a recommendation.

The non-goals do more work than any other section. The spec for the new case workspace said: no single-page-app rewrite, no React or Vue, no persistence owned by the web layer. The spec for LLM "refiners" (rules that send a case item to a model and write the answer back as a note) said: no Python sidecar, no autonomous tool-using agents, one action type only. Each line closes off a direction that an eager agent would otherwise explore at my expense.

The other section I depend on is **open questions, with recommended defaults**. The refiners plan ended with four questions. Each one had a default: one global LLM profile in version 1, a fixed note format, replay over the last 7 days, and deduplication on refiner, case and entity. I can answer that in a minute. If I say nothing, the agent has a documented choice and doesn't guess.

## Hand off in workstreams, not in one big prompt

A spec says what to build. A delegation plan says who builds which part, in what order. The refiners feature split into seven workstreams: shared contracts, worker persistence, worker request handling, the refiner runtime, the case workspace tab, the LLM settings tab, and tests. Each one lists its primary files, deliverables and dependencies. Contracts and persistence started together. The web work waited for stable worker contracts. Tests started early and finished last.

Each workstream also gets its own prompt. The prompts are short and have the same shape. They give the scope, the pattern to copy, what not to touch, and what to report:

```text
Implement the shared DTOs and local event contracts for case refiners and
LLM settings in `core`. Mirror existing watchlist and account-credential
patterns. Do not edit worker or web. Add serialization tests. Return a summary
of files changed and any unresolved naming questions.
```

"Mirror existing patterns" is the most useful instruction I give. Watchlists are case-scoped rules with a table, a drawer and a replay action, and refiners have the same shape. Pointed at the watchlist code, the agent copies a design I have already reviewed instead of inventing one.

Some rules go into every task. When the browser JavaScript was split into modules in April, every task had to keep the existing `id` and `data-*` hooks. A refactor that renames and moves things at once is very hard to review.

## Put the architecture where the agent reads it every time

Kayori has one architecture rule that matters more than the others. The web console is a presentation layer. Durable state belongs to the worker, and the web layer reaches it by publishing a request on a local topic and waiting for the response.

I learned to write this down the hard way. In March, an early version of analyst notes and triage state lived in the browser's local storage. It worked in a demo, but no other node or analyst could ever see that state. I had it moved into the worker and added the rule to `AGENTS.md`, the instruction file coding agents read at the start of every session.

The file says what to do, what not to do, and where persistence belongs. It ends with a decision check for any backend-like code in the web layer:

- Should this state survive beyond the current browser session?
- Should another node, worker or user eventually be able to see or process it?
- Does the existing news flow suggest a request and response over local topics?

If any answer is yes, the work goes through the worker.

The same file sets the visual rules. The feed page is the reference design, and new screens reuse its vocabulary: dense tables, a detail panel, drawers. No new visual language unless I ask for a redesign. That is my design system, written as sentences an agent can follow.

## UI work: design system, prototypes, then verification

For larger UI changes I add a design step before the spec. The case workspace in late March is a good example.

1. **Brainstorm.** A one-page brief: what a case workspace could hold (a brief, a timeline, evidence, pinned notes, watchlists), which UX moves to try, and what to keep from the current console.
2. **Prototypes.** It built three self-contained HTML pages, each with a different idea: a command workspace with a case queue and a context rail, an operations board, and a narrative "briefing and timeline" layout.
3. **Blend.** I chose parts from each, and the model built a fourth, blended prototype.
4. **Full-stack spec.** Only then a spec that turned the blended page into routes, templates, worker messages and tests.

Prototypes are cheap to throw away. Arguing about a layout in a spec is slow; looking at three side by side is fast.

Verification for UI work uses Playwright, a browser-testing tool, against a mock server. The `AGENTS.md` rule here is easy to miss: the mock server must simulate the real request and response flow, not replace it with something simpler. A test that passes against a shortcut proves nothing about the product.

## Verify like CI, and write down what you ran

The most expensive phrase an agent can say is "tests pass". Which tests, run how, with what result? These are the testing instructions I wrote for agents in March:

1. Compare the branch with main first. Understand the intended behavior change before editing anything.
2. Run the smallest failing test first, but don't stop there. Run the whole suite again before finishing.
3. Treat any flaky pass, or any pass that depends on test order, as a real bug.
4. Keep the app and the tests on the same database and configuration.
5. Never assume that a passing targeted test means the branch is healthy.
6. Before handing off, report what changed, what commands ran, whether the full suite passed, and what is still unverified.

For Kayori, "the whole suite" means the same two commands that CI runs on every pull request:

```bash
cargo test --workspace
npm run test:e2e
```

Each plan keeps a running record of verification: the exact commands, focused ones while debugging and full ones at the end, and whether they passed. Pull request descriptions end with the same block. It is a ledger, and it is the first thing I read.

One of these rules came from a bad evening. On April 1 an agent made three commits in a row to stabilize the same group of watchlist browser tests. Twenty minutes after the last one, it changed the local Playwright worker setting to match CI. The rule now says: if CI runs with two workers, local verification runs with two workers, from a fresh server start. Flaky tests are the worst thing to give an agent. Each "fix" looks reasonable, and none of them is the fix.

When there is a bug, the fix spec asks for a test that reproduces the failure that started the investigation. A test that would have caught the bug is worth more than a test of the new code.

## Investigate before you edit

When something is broken or slow, the first task is read-only. The agent investigates and writes findings. It does not change code yet.

In mid-April the feed got slow in production. The findings document traced it to the feed handler: a request for 10 items loaded up to a million rows from each source table, converted every row, sorted the whole set in memory, and only then kept 10. A direct top-10 query would have been fast; the handler never ran one. The findings led to two specs: a short remediation, then a longer change to a projection table built for the feed. The remediation shipped within days, and the projection work started the same month.

A watchlist bug the same week went the same way. The watchlist form had a multi-select for which item types to watch. The server read it as a single string, and an empty result fell back silently to "news only". So a watchlist that looked right in the form could silently skip social posts. The spec put the root cause first, then the fix, then a test for that exact failure.

Why read-only? The agent's first theory is often wrong, a findings document is cheap to review, and edits made during an investigation mix the evidence with the fix.

## Review against the spec, with a fresh reader

When a branch is "done", a different model reads the spec, the delegation plan and the branch, and writes a gap review.

The refiners gap review in April was typical. The core flow worked: refiners triggered when an item was linked to a case, called the model, and wrote a note. But the review found eleven gaps. The most important ones were these:

- The data model supported custom output fields, but the UI had no way to edit them.
- A note template field was saved but never used when the note was written.
- The trigger setting offered a "scheduled" mode that had no code behind it.
- The spec asked for a way to send metadata only and leave out the full text before content went to an external model. That control did not exist.

All of these were closed in follow-up work. The pattern is the useful part. **Agents build the data layer completely and leave the UI half-wired, and the UI then offers choices that do nothing.** A reviewer that compares the spec with the shipped behavior finds this quickly. The author of the code rarely does.

The review is the input for the next round. For the entity metadata work, the review ranked findings High or Medium against sections of the spec, and a delegation spec turned each gap into a small task with an outcome, a scope, a "do not do" list and acceptance criteria.

## Where I stay in the loop

Agents do the typing. I keep the decisions in five places.

1. **Open questions.** Product choices are mine, even when the default is good.
2. **Anything that reaches the outside world.** For a new data source, the agent got an offline copy of a page and no live requests until I said so. When refiners send case content to a model endpoint, the analyst is told and decides how much is sent.
3. **When the agent hits a wall.** The Postgres work hit a hard limit in the database library's multi-backend support. The agent stopped and wrote a blocker document: the compiler errors, four alternatives and a recommendation to keep the finished groundwork and re-scope the rest. The decision was mine, and that document was worth more than another day of attempts.
4. **Architecture rules.** Agents follow `AGENTS.md`. I write it.
5. **Merging.** Reviews end with a verdict, and a verdict is advice. A review can say a branch is close to production quality but not ready, and I decide what happens next.

## What wastes tokens

These are observations, not measurements. I have not measured token use per task in a controlled way.

- **No spending limit.** In February, while I experimented with a self-hosted agent gateway, token use ran away from me. Now each API key on my model router has a daily limit. Set the limit before the first long run, not after.
- **Flaky tests.** An agent will rerun and "fix" a flaky test many times. Make the local test setup match CI first.
- **Fighting the toolchain.** Each attempt to force an abstraction past a library's limits costs a full compile-and-read cycle. Tell agents to stop and write a blocker after a few failed attempts.
- **One giant prompt.** "Build the feature" makes the agent read the whole repo and plan in its own context. A workstream with a file list and a pattern to copy starts closer to the work.
- **Specs that promise more than version 1.** When the spec describes a richer feature than the branch delivers, every review finds the same gaps again. After the first review, either finish the work or move it into the spec for version 1.1.

## What I would tell someone starting

Write the non-goals. Ask for open questions with defaults. Give each agent one job and a finish line. Put your architecture in the file the agent reads every session. Make verification match CI, and make the agent write down what it ran. Have a different model review the work against the spec. Then decide yourself.

None of this is new. It is how a good engineering lead runs a team of contractors. These contractors just start every session with no memory, so everything they need to remember has to be written down.
