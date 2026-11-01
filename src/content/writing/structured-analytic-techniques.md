---
title: "Structured analytic techniques: a working reference"
description: "The structured analytic techniques I actually use, grouped by family, with when to use each one, how to run it, and how it fails."
date: 2026-03-21
pillar: osint
tags: ["tradecraft", "analysis", "sats", "osint"]
toc: true
---

Analysts are not paid to be clever. They are paid to be less wrong than the people who guess. The gap between those two is mostly method, and the best-documented method we have is a set of tools called structured analytic techniques, or SATs.

A SAT is a step-by-step way to think through a problem so that your reasoning is visible and someone else can check it. Some are simple, like writing down your assumptions. Some are more formal, like scoring evidence against several explanations in a matrix. All of them do the same job: they slow you down at the points where your brain likes to take shortcuts.

This page is my working reference. It covers the techniques I use most, in the order I reach for them, and a short table for the rest. It is a summary in my own words. For the full methods, read the two sources at the end.

## Why bother with structure

Richards Heuer, a CIA veteran, made the case in *Psychology of Intelligence Analysis* (1999). Everyone reads new information through a mental model, also called a mind-set. A mind-set is the set of assumptions and expectations you build from experience. It lets you process a lot of information fast. It also makes you see what you expect to see, hold on to a view after the evidence changes, and quietly discard facts that do not fit.

Experience does not fix this. Experts can be more exposed, because their models have worked before.

Structure helps in three ways:

- **It makes assumptions visible.** You cannot challenge an assumption you never wrote down.
- **It forces alternatives.** Most bad calls come from never seriously considering the explanation that turned out to be true.
- **It leaves a trail.** When a judgment is wrong, a written method shows you where it went wrong, so you can fix the method and not just the answer.

> [!NOTE]
> SATs do not produce answers. They produce better questions and a record of how you reached your answer. The judgment is still yours.

## How to pick a technique

The 2009 CIA *Tradecraft Primer* sorts its twelve techniques into three groups. I find that grouping the most useful for choosing what to do next:

| Group | What it does | Reach for it when |
|---|---|---|
| Diagnostic | Makes assumptions, evidence and arguments visible | You have a working answer and need to test it |
| Contrarian | Challenges the current view on purpose | The team agrees too fast, or the cost of being wrong is high |
| Imaginative | Generates new explanations and futures | You are stuck, or the future is open |

A rough order that works for most projects:

1. **At the start:** Key Assumptions Check and brainstorming. Know what you believe before the evidence arrives.
2. **While collecting:** Quality of Information Check, and ACH once you have competing explanations.
3. **Before you publish:** a Premortem or Devil's Advocacy on the main judgment.
4. **After you publish:** Indicators, so you know what would tell you that you were wrong.

The rest of this page follows the three groups. Heuer and Pherson's book uses a finer set of families. I use those in the table at the end.

## Diagnostic techniques

### Key Assumptions Check

**What it is.** A written list of the beliefs your analysis depends on, with each one tested.

**When to use it.** At the start of any real project. Again before you publish. Always when you inherit someone else's analysis, because inherited assumptions are the ones nobody looks at.

**How to run it.**

1. Write the analytic question in one sentence.
2. List every working assumption. Include the boring ones: that a source has access, that a data feed is complete, that last year's pattern still holds.
3. For each one, ask why you believe it and what would have to be true for it to hold.
4. Mark each as **supported**, **supported with caveats**, or **unsupported**. Be honest about the third group.
5. Circle the assumptions that would change your conclusion if they were wrong. Those become collection priorities and, later, indicators.

**Pitfalls.**

- The most dangerous assumptions are the ones you do not know you hold. Do this with someone who does not share your background.
- A shared assumption in a group feels like a fact. Agreement is not evidence.
- Under time pressure the list gets short. A short list is a warning sign, not a sign of a clean problem.

### Quality of Information Check

**What it is.** A review of the sources behind your judgment: what each one is, how it got its information, and how much weight it can carry.

**When to use it.** When a conclusion rests on a few sources. When a key source is new, anonymous or single-threaded. In OSINT, when several "independent" reports may trace back to one original post.

**How to run it.** List the key reports. For each, note where it came from, whether you have seen the original, and whether it has been corroborated by a truly separate source. Flag anything that has been repeated so often it feels confirmed but has one origin. Re-check the sources behind your main judgment whenever that judgment changes.

**Pitfalls.** Circular reporting is the big one. Ten articles that cite the same tweet are one source. The second is grading a source once and never again; reliability changes.

### Indicators

**What it is.** A list of observable events that would show a situation is moving toward one outcome or another. The Primer calls them indicators or signposts of change.

**When to use it.** Any time you make a judgment about the future, and any time someone needs early warning.

**How to run it.**

1. Define the outcomes you care about, usually two to four scenarios or hypotheses.
2. For each, list what you would expect to observe if it were starting to happen. Make them specific and observable. "Tensions rise" is not an indicator. "A new domain on the same registrar starts sending invoices from a lookalike of example.com" is.
3. Record a baseline: what normal looks like today.
4. Set a threshold for each indicator: what level of change you will treat as significant.
5. Review the list on a schedule, and write down what you saw, even when it is nothing.

**Pitfalls.**

- An indicator that would appear under every scenario tells you nothing. Heuer and Pherson's Indicators Validator exists to catch these: for each indicator, ask how likely it is under each scenario, and drop the ones that do not discriminate.
- Indicators go stale. An adversary that learns what you watch can stop doing it.
- More indicators are not better. Five good ones beat thirty vague ones.

### Analysis of Competing Hypotheses (ACH)

**What it is.** A matrix that tests several explanations against the same evidence. The key move is that you try to **disprove** hypotheses, not prove one. The explanation with the least evidence against it survives.

This is Heuer's own technique, and it is the one I use most.

**When to use it.** When there are several plausible explanations and the call matters. When people disagree and you need to see exactly where. When deception is possible.

**How to run it.**

1. **List the hypotheses.** Aim for a complete set where, ideally, only one can be true. Include the unwelcome ones, and include deception if an adversary could be shaping what you see.
2. **List the evidence and arguments.** Include assumptions, and include things you would expect to see but have not. Absence is evidence too.
3. **Build the matrix.** Hypotheses across the top, evidence down the side. Mark each cell consistent (C), inconsistent (I) or not applicable (N/A).
4. **Look for diagnostic evidence.** A row that is consistent with every hypothesis has no diagnostic value, however compelling it feels. The useful rows are the ones that split the hypotheses.
5. **Refine.** Merge hypotheses that the evidence cannot separate. Add any new ones that came up, and re-score.
6. **Draw a tentative conclusion.** Count the inconsistencies. The hypothesis with the fewest is the strongest candidate, not the proven one.
7. **Test sensitivity.** Ask which few items drive the result. If one of them is wrong or planted, does the answer change?
8. **Report all of it.** State the relative likelihood of every hypothesis, not just the winner, and say what would change your mind.

A small example. A public login page at `login.example.com` stopped responding at 02:10 UTC.

| Evidence | H1: hardware failure | H2: DDoS | H3: bad config push | H4: host took it down |
|---|---|---|---|---|
| Other sites on the same host are up | I | C | C | C |
| A config deploy ran at 02:05 | N/A | N/A | C | N/A |
| No traffic spike in edge logs | C | I | C | C |
| Host support says it took no action | C | C | C | I |

H3 has no inconsistencies, so it is the lead. But the deploy record is the only row that points at it directly. Before you say "config push", confirm what that deploy changed.

**Pitfalls.**

- ACH only works if you come in open. If you have already decided, you will score the evidence to match.
- The scores are not a formula. They reflect the quality of your inputs, and a few strong items can matter more than many weak ones.
- It often leaves you less certain than when you started. That is usually the honest result.
- The hypothesis list is the ceiling. If the true explanation is not on it, the matrix cannot find it. Brainstorm before you build.

**Related.** For one new piece of information, a lighter version called Diagnostic Reasoning asks the same question: would I expect to see this under each explanation? For suspected manipulation, Deception Detection adds deception as an explicit hypothesis and asks whether the source, timing and motive fit.

## Contrarian techniques

These exist because groups converge. Once a view is shared, it gets harder to argue against, and nobody wants to be the one who slowed things down. Contrarian techniques make disagreement a job, not a personality trait.

### Devil's Advocacy

**What it is.** One person is assigned to build the strongest case against the current judgment.

**When to use it.** When agreement came quickly. When the stakes are high. When the main judgment rests on a few key assumptions.

**How to run it.**

1. Give the advocate the full analysis and the evidence, not just the conclusion.
2. They start from the key assumptions and look for the weakest ones.
3. They build the best opposite case they can, with evidence, and present it.
4. The group responds on the merits. Record which challenges held up.
5. Revise the analysis, or document why it stands.
6. Rotate the role, so it does not belong to one person.

I like a fixed output format for the advocate: state the opposite claim in one line, list three to six counterarguments with the reasoning behind each, show which assumptions they attack, give the implications if the opposite is true, propose tests that would tell the two views apart, and end with a confidence level. The format stops the exercise from becoming a speech.

**Pitfalls.**

- It turns personal fast. Frame it as a test of the analysis, never of the analyst.
- It becomes ceremonial. If the conclusion never changes after devil's advocacy, either the analysis is excellent or nobody is taking the role seriously.
- One advocate can only argue one alternative. If there are several, use ACH or a Team A/Team B.

### Team A/Team B

**What it is.** Two teams each build the strongest case for a different view, then present and debate in front of a neutral audience.

**When to use it.** When there are two well-supported, strongly held views and the argument has stalled. It works best when both sides already have evidence and people behind them.

**How to run it.** Each team writes its case: key assumptions, key evidence, and conclusion. They exchange papers, prepare rebuttals, and present. A neutral judge, often the decision maker, asks questions and decides or sets out what further collection would settle it.

**Pitfalls.** It costs time and people. It can harden the two camps if the debate is run as a contest. The aim is to make the disagreement precise, not to name a winner.

### Premortem

**What it is.** Imagine it is some months from now and your judgment turned out to be badly wrong. Explain why.

This one comes from decision research, not intelligence, and Heuer and Pherson adopted it. It works because people find it easier to explain a failure that "already happened" than to criticize a plan they just agreed to.

**When to use it.** Just before you publish a major judgment. When confidence is high. On any plan.

**How to run it.**

1. State the judgment and say: assume this was wrong.
2. Each person writes, alone and in silence, the reasons it failed. Silence matters: it stops the most senior voice from setting the list.
3. Go round the room and collect every reason.
4. Group them. Look for reasons that trace back to one assumption or one source.
5. Check the current analysis against the list. Fix what you can. Turn the rest into indicators.

**Pitfalls.** Done too often, it breeds pessimism and delays decisions. It also cannot surface a failure nobody in the room can imagine, so invite someone from outside the team.

**Related.** Structured Self-Critique is the follow-on: the team answers a fixed set of questions about its sources, assumptions, evidence and alternatives, playing the role of its own harshest reviewer.

### What If? Analysis

**What it is.** Assume an unlikely event has already happened. Work out how it could have come about and what it would mean.

**When to use it.** To get decision makers to think about a contingency without first having to win the argument about probability. It is also a tactful way to tell a team it might be wrong.

**How to run it.** Pick a specific event. Assume it has happened. Build the most plausible path to it, step by step. List what you would have seen along the way, then check whether any of it is visible now. Close with what the event would mean and what you would do.

**Pitfalls.** You can only analyze what you can imagine. Do not let a vivid scenario feel more likely just because you have described it in detail.

### High-Impact/Low-Probability Analysis

**What it is.** The same backward reasoning, aimed at events that are unlikely but would be very damaging, or very important, if they happened.

**When to use it.** When something new hints that an unlikely event is less unlikely than it was. When a "nightmare" outcome has been dismissed without much thought.

**How to run it.** Define the event clearly. Assume it happens. Map the plausible paths and the triggers that would set them off. Identify what you would observe early. Reassess the probability with that in mind, and recommend what to do now.

**Pitfalls.** It can look alarmist, so frame it carefully. Rare-event probabilities are always soft. Say so.

## Imaginative techniques

### Structured brainstorming

**What it is.** A group idea session with rules: a clear question, a time limit, no criticism while ideas are being generated, and a separate step to sort them.

**When to use it.** At the start of a project to build the hypothesis list. Before ACH, because ACH can only test what you thought of.

**How to run it.** Write the question on the board. Give everyone a few minutes to write ideas alone first. Collect every idea without comment. Then cluster them, name the clusters, and look hard at the ideas that do not fit any cluster. Those outliers are often the point of the exercise.

**Pitfalls.** Without the silent start, the loudest person sets the agenda. Heuer and Pherson's Nominal Group Technique, where people present ideas in turn, is a stricter fix for this.

### Outside-In Thinking

**What it is.** Start with the forces outside the problem, such as economic, political, technical, social and environmental trends, and ask how each one could shape it. Most analysts work inside-out, from the details they know best.

**When to use it.** When you are deep in a subject and may be missing the bigger picture. When you are analyzing your own organization or side.

**How to run it.** Name the issue. List the external forces that could affect it, including ones you cannot control. For each, ask how it could change the outcome. Then go back to the details and ask what they look like with that context in mind.

**Pitfalls.** It is easy to list forces and never link them back to the problem. Each force needs a "so what".

### Red Team Analysis and Red Hat Analysis

**What it is.** Two related ideas. Red Hat Analysis is an individual analyst trying to think like a specific adversary: their goals, constraints, culture and options. Red Team Analysis gives that job to a separate team, often with more independence and a mandate to challenge the official view.

**When to use it.** When you need to predict what another party will do. When you suspect mirror-imaging, which means assuming the other side thinks the way you do.

**How to run it.**

1. Define who the adversary is and what decision you are trying to predict.
2. Build their picture of the situation. What do they want, what do they fear, what do they know and not know?
3. Answer in the first person, as them: "I would...". It sounds odd. It works, because it breaks your own frame.
4. Present the result as a challenge to the main analysis, and record how the main analysis responds.

**Pitfalls.**

- You may not know the adversary well enough to think like them, and you will fill the gaps with your own assumptions.
- A red team that depends on the people it is reviewing will tell them what they want to hear. Give it independence.
- The vault notes I started from describe Red Hat Analysis as Six Thinking Hats, which is a different method. Check which one a team means before you run it.

### Alternative Futures Analysis

**What it is.** A scenario method. Pick the two forces that matter most to the outcome, give each a range, and cross them in a two-by-two grid to get four distinct futures.

**When to use it.** When the future is open and you need to prepare for more than one outcome. As the step before building indicators.

**How to run it.**

1. State the question and the time frame.
2. Brainstorm the forces that could shape the outcome.
3. Pick the two that are both very important and very uncertain.
4. Define the two ends of each. Draw the grid. Each quadrant is a future.
5. Name each future and write a short story of how it comes about.
6. For each future, write indicators. Watch them to see which future is arriving.

**Pitfalls.** Two drivers can oversimplify. If there are more, use Multiple Scenarios Generation, which crosses several pairs. Scenarios are not forecasts. Readers will treat the most vivid one as the prediction unless you say clearly that it is not.

## The rest of the toolkit

Heuer and Pherson's second edition groups 55 techniques into eight families. The third edition (2020) has 66 techniques in six families that follow the analytic process. My notes follow the second edition. The techniques above appear in several of these families; the table covers the others in a line each.

| Family | Technique | One-line summary |
|---|---|---|
| Decomposition and visualization | AIMS | Before you write, fix the audience, issue, message and storyline. |
| | Customer Checklist | A short set of questions about what the reader needs, before you start. |
| | Issue Redefinition | Restate the question several ways to find the one that is really being asked. |
| | Chronologies and Timelines | Put events in order to see sequence, gaps and possible cause. |
| | Sorting | Group data by a shared attribute to see its structure. |
| | Ranking, Scoring, Prioritizing | Order items against explicit criteria, including paired comparison and weighted ranking. |
| | Matrices | Lay information on a grid to compare items on several dimensions. |
| | Venn Analysis | Draw overlapping sets to test an argument's logic and find gaps. |
| | Network Analysis | Map links between people, groups or things, and look for hubs and brokers. |
| | Mind Maps | Draw ideas around a central topic to see what you know and what is missing. |
| | Process Maps and Gantt Charts | Map the steps and timing of a process to find bottlenecks and dependencies. |
| Idea generation | Virtual Brainstorming | Brainstorming over shared tools, for teams in different places or time zones. |
| | Nominal Group Technique | Ideas presented in turn, so no one person dominates. |
| | Starbursting | Generate questions, not answers, using who, what, when, where, why and how. |
| | Cross-Impact Matrix | Check how each factor in a problem affects every other factor. |
| | Morphological Analysis | List the dimensions of a problem and their values, then examine the combinations. |
| | Quadrant Crunching | Reverse key assumptions in pairs to generate outcomes nobody had considered. |
| Scenarios and indicators | Simple Scenarios | Two or three alternative futures, written quickly. |
| | Cone of Plausibility | Project key drivers forward to a baseline scenario, then vary them to get plausible alternatives and a wildcard. |
| | Multiple Scenarios Generation | Cross several pairs of drivers to get a wider set of futures. |
| | Indicators Validator | Test whether each indicator separates the scenarios. |
| Hypothesis generation and testing | Simple Hypotheses | Write explanations as clear statements you can test. |
| | Multiple Hypotheses Generator | Vary the who, what and why of a lead hypothesis to produce alternatives. |
| | Quadrant Hypothesis Generation | Cross two key uncertainties to produce four hypotheses. |
| | Argument Mapping | Draw the claims, reasons and objections behind a conclusion. |
| Cause and effect | Structured Analogies | Compare the case with several past cases, and list how each one is similar and different. |
| | Role Playing | Act out the parties in a conflict or negotiation to see how they interact. |
| Challenge analysis | Delphi Method | Several rounds of anonymous expert input, with feedback between rounds. |
| Conflict management | Adversarial Collaboration | People who disagree agree on a test that would settle it. |
| | Structured Debate | A formal debate between two positions, with rebuttals, for an audience. |
| Decision support | Decision Trees | Map choices, chance events and outcomes as branches. |
| | Decision Matrix | Score options against weighted criteria. |
| | Pros-Cons-Faults-and-Fixes | List pros and cons, then try to fix each con and fault each pro. |
| | Force Field Analysis | List the forces that help and hinder a goal, and weigh them. |
| | SWOT Analysis | Strengths, weaknesses, opportunities and threats for a plan. |
| | Impact Matrix | For each party, assess how a decision affects them and how they may react. |
| | Complexity Manager | A simple, qualitative way to map how variables in a system affect each other. |

## Using a model as the contrarian

Language models are useful in contrarian work, with one caution. Their default is to agree with you. Ask a model whether your assessment is sound and it will usually find reasons it is.

What works for me is to give it a role and a format, not a question. Tell it to argue the opposite position, to list the assumptions it is attacking, to separate evidence from speculation, and to finish with a confidence level and the tests that would settle the matter. Then treat its output like any other devil's advocate paper: a list of challenges to check, not a verdict. The checking stays with a person.

## Common failure modes

The techniques fail in a few predictable ways, whichever one you use:

- **Ritual.** Filling in the template after the decision is made. If the method never changes an answer, it is decoration.
- **Garbage in.** Every technique depends on the hypotheses, assumptions and evidence you give it. Spend the most time there.
- **False precision.** Scores and matrices look exact. They are structured opinion. Say so in the product.
- **Skipping the record.** The value of a SAT is the trail it leaves. Keep the matrix, the assumption list and the premortem notes with the finished product.
- **One technique for everything.** Most problems need a diagnostic step and a contrarian step. Pair them.

## Sources

- Richards J. Heuer Jr. and Randolph H. Pherson, *Structured Analytic Techniques for Intelligence Analysis* (CQ Press). The second edition is the one my notes follow. The third edition, with Randolph Pherson as lead author, was published in 2020. The standard reference, with full steps for every technique above.
- US Government, [*A Tradecraft Primer: Structured Analytic Techniques for Improving Intelligence Analysis*](https://www.cia.gov/resources/csi/books-monographs/a-tradecraft-primer/) (March 2009). Free, short, and the best place to start. The diagnostic, contrarian and imaginative grouping comes from here.
- Richards J. Heuer Jr., [*Psychology of Intelligence Analysis*](https://www.cia.gov/resources/csi/books-monographs/psychology-of-intelligence-analysis-2/) (CIA Center for the Study of Intelligence, 1999). The reasons behind all of this, and the original description of ACH.
