---
title: "Building Kayori: an analyst's notebook, not a dashboard"
description: "Why I am building Kayori, a self-hosted OSINT workstation, what the first prototype taught me, and why I started again in Rust with a mesh in mind."
date: 2025-10-18
pillar: building
tags: [kayori, osint, rust, libp2p, architecture]
layout: standard
toc: true
---

> [!NOTE] Update, November 2026
> This post describes Kayori as it stood in October 2025. I later dropped the peer-to-peer mesh described below, and Kayori is now a single self-hosted install. For where it is today, read [A day in Kayori: the interface refresh](/writing/kayori-ui-refresh/).

Many intelligence tools are built around a dashboard: a wall of charts, a map, a live feed and a count of alerts. They are good at showing that something is happening. They are bad at helping you work out what it means.

An investigation does not live on a wall. It lives in a notebook: the sources you trust, the items you kept and why, the people and organizations that keep coming up, the notes you wrote along the way, and the question you are actually trying to answer. I am building **Kayori** to be that notebook for analysts who work with open-source intelligence (OSINT), the information anyone can legally collect from public sources.

This post is the founder's view of where the project stands in October 2025. It covers what Kayori is for, what the first prototype taught me, and why I started again in Rust this month.

## The problem with dashboards

A dashboard answers "what is new?". An analyst needs to answer "what matters to my question, and how sure am I?". Those are different jobs.

When I sketched Kayori in January, I wrote down what the platform has to do. Four jobs have stayed at the center:

| Job | What it means in practice |
|---|---|
| Collect | Jobs that pull in public data on a schedule, starting with news feeds |
| Process | Rules and LLM "processors" that read new items and produce alerts, summaries and structured fields |
| Correlate | One entity for one real thing. A company is the same record whether it shows up in a news article, a filing or a website |
| Investigate | Projects and cases that hold the items, entities and notes for one question, with rules that add new matching items automatically |

The dashboard view is the first row only. The value is in the last three rows, and especially the last one. A case is where an analyst's judgment is written down. Everything else in the system should feed it.

There is a second requirement, and it shaped the architecture more than any feature. The same software has to run on one small server for a single analyst, and grow to many servers for a team. That was in my first brief, and it has not changed.

## Version one: microservices because a model said so

In January 2025 I asked a language model to act as a solutions architect and propose a stack for this platform. It did what such prompts usually do. It proposed a "cutting-edge" design: microservices, an event backbone on Apache Kafka, Docker containers orchestrated by Kubernetes, an API gateway, PostgreSQL, Elasticsearch, Redis, an optional graph database, and separate services for LLM processing and media.

I did not build all of that, but I built a lot of it. From February to April I wrote the first prototype:

- a **backend API** in Go;
- **drones**, Go workers that took collection jobs from a Kafka topic, ran them and stored the results;
- a **web frontend** with a live feed over WebSockets;
- **Kafka** as the job queue and event stream;
- a database, first Apache Cassandra, then MongoDB;
- **Ollama** for local LLM work;
- Kubernetes manifests to run it all on a local cluster.

A collection job was a small JSON document. The drone picked it up, fetched the feeds, and wrote each article back as an "artifact" with a checksum for deduplication:

```json
{
  "id": "12345",
  "service": "rss",
  "title": "test",
  "task": {
    "urls": [
      "https://news.example.com/world.rss",
      "https://news.example.com/politics.rss"
    ]
  }
}
```

It worked. By April the prototype could schedule collection jobs, show and filter a feed of news articles with their sources, page through results, remove duplicates, cluster similar articles, call a local model through Ollama, and group work into projects with a collect, process and analyze pipeline.

## What the prototype taught me

### The data model comes from the questions

I started on Cassandra. Cassandra wants you to design one table for each query you plan to run. So I had a main artifacts table and separate lookup tables by checksum, by source and by job. That is the right discipline for a very large write-heavy system. It was also a lot of design work before I knew which questions analysts would ask. In February I moved to MongoDB and kept going.

The lesson I kept is the discipline, not the database. Write down the queries first. "Show me the newest items for this case" and "has this exact article been seen before?" are different questions, and each one needs its own path through the data.

### Scaling workers is a solved problem, and I didn't need it yet

I spent time on how to scale drones. The research was clear. Kafka works best with a pool of long-running consumers, and you scale the size of the pool on queue lag (the gap between messages produced and messages consumed). A tool such as KEDA, Kubernetes Event-Driven Autoscaling, can do that, and can even scale to zero when there is no work. Starting a new container for every message gives perfect isolation, but it is slow and costly when the queue is busy.

That was useful to learn. It was also a sign. I was solving a scaling problem for a system with one user.

### The operating cost was in the wrong place

To run the prototype on my own machine I needed Kafka, a Kafka admin UI, the database and its admin UI, the backend, the drones and the frontend. That is seven Kubernetes manifests before the first article arrives. The "small server" half of my requirement was technically met. In practice, I would not ask a single analyst to run it.

The model's stack was not wrong. It was a stack for a company with a platform team. I had asked for "cutting-edge" and got exactly that. The better question would have been: what is the smallest system that can still grow?

## Version two: one binary and a mesh

On 7 October I started again, in Rust. The rework keeps the jobs from the table above and changes the shape of the system.

These are the principles I wrote down for it:

- Kayori server and client are **the same binary**.
- The backbone is **publish/subscribe** messaging, inside a node and between nodes.
- Kayori nodes form a **mesh network**.
- Access to a mesh is **default deny**.
- Nodes are considered **untrustworthy**.
- Information can be shared between nodes, and **node admins control what is shared**.
- Shared information is labeled with the **Traffic Light Protocol** (TLP), the standard markings (red, amber, green, clear) that say how far a piece of intelligence may travel.

The idea is simple to state. One analyst runs one binary on one machine and gets a complete tool. A team runs several nodes, and the nodes share what their admins allow. Scaling is adding nodes, not adding services.

### What exists today

It is early, and I want to be precise about what is built. As of this week the Rust code has:

- a command-line interface built with clap;
- a proof of concept with libp2p, the peer-to-peer networking library that IPFS uses, running on the Tokio async runtime. It uses TCP transport, Noise for encryption and authentication, Yamux to carry several streams over one connection, and gossipsub for publish/subscribe;
- a local message bus inside the process;
- a server that reads commands and drives the libp2p swarm (libp2p's name for the set of connections a node manages).

That is the foundation, not the product. There is no database in the Rust version yet. I am choosing between an embedded key-value store (RocksDB or sled), flat files and SQLite. There is no web interface yet either.

### The planned job protocol

I have sketched how a collection job, such as fetching a news feed, would move across the mesh. It is a short conversation on two kinds of topic. A shared dispatch topic carries the offer. A topic for each job carries the work.

```text
On jobs/dispatch:
  REQUEST  RSS {job-id}           a node asks for a job to run
  AFFIRM   RSS {job-id}           a node agrees to take it
  DISPATCH RSS {job-id} {payload} the job details are sent
  CONTACT  jobs/{job-id}          move to the job's own topic
  SEEYA    jobs/{job-id}

On jobs/{job-id}:
  STATUS   job started
  PROGRESS 40PCT
  STATUS   completed
  QUERY    RESULTS
  RESULTS  {payload}
  AFFIRM   {payload hash}         the receiver confirms what it got
  GOODBYE
```

A node can come back later, ask for the results of a job by its id on the dispatch topic, and get them on the job's topic again. Confirming the hash of the payload means a node knows it received what was sent.

The command line in my notes is just as plain. Start a server, list jobs, create a job:

```bash
kayori server
kayori jobs
kayori jobs --create --type RSS --url https://news.example.com/feed.rss --schedule hourly
```

This is a design, not a promise. The protocol will change once real nodes start to talk to each other.

## What Rust gives the design

Two of the principles point straight at Rust.

A single binary is a real deployment story. Copy one file to a machine and run it. No container platform, no message broker to operate.

libp2p in Rust gives me the hard parts of a mesh without building them myself: encrypted connections, peer identity, multiplexed streams, and gossip-based pub/sub. A node that treats its peers as untrustworthy needs strong identity and encryption from the first connection, not as a later feature.

The cost is speed. After a week and a half, the Rust version still collects nothing. For a tool meant to run on hardware its users control, I think a sound foundation is worth that.

## What I am keeping from version one

Starting again does not mean throwing everything away.

- **Collection is a job, and a job is data.** A job is a small document that any node can store, send and run.
- **Deduplicate early.** A checksum on every collected item, from day one.
- **The case is the center.** The feed exists to feed cases. Rules that attach matching items to a case belong in the core, not in a plugin.
- **LLMs are processors, not oracles.** A model reads an item and writes alerts, summaries or structured fields that an analyst can check. The analyst makes the call.

## The notebook comes first

The architecture is the part I can show this early, so it is most of this post. It is not the point. The point is the analyst at the end of it, with one question, a case that holds what they found, and a tool that does the collecting and sorting so they can do the thinking.

A dashboard tells you that something happened. A good notebook helps you decide what it means and shows how you got there. That is what I am building Kayori to be.
