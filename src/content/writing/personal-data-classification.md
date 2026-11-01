---
title: "A personal data classification system"
description: "A simple template for individuals and small teams to label information by harm, and to mark how it must be stored and shared."
date: 2025-06-14
pillar: security
tags: [classification, opsec, privacy, data-handling]
layout: standard
toc: true
---

Governments don't protect every document the same way. They sort information by how much harm its release would cause, then attach rules for who may see it and how it may move. Most of us do the opposite. Tax returns, password exports, medical letters and shopping lists sit in the same folders, sync to the same cloud, and travel on the same laptop.

A personal system can sit in between: light enough for one person or a small team, but built on the same two ideas. This post is a template. Copy it, then change the names. Changing them is part of the advice, and the last section explains why.

## Two ideas

The system has two parts.

1. **A classification**, which says how much damage disclosure would cause. Every item gets exactly one.
2. **Control markings**, which add specific rules: who may access the item, how it must be stored, and how it may be shared. An item can have none, or several.

The classification tells you how careful to be. The markings tell you what "careful" means for this item.

The system applies to anything that touches data: documents and files, but also computers, drives, phones and networks. A device or network takes the highest classification of the data it holds or carries.

## Four classifications

| Classification | Short form | Disclosure would cause |
|---|---|---|
| RESTRICTED | R | Severe damage |
| SENSITIVE | S | Moderate damage |
| INTERNAL | I | Minor damage |
| PUBLIC | P | No harm |

"Damage" means damage to you, your household or your organization. Pick whichever one you're protecting and keep it fixed. The question is always the same: *if this leaked tomorrow, how bad would it be?*

Four levels are enough. With more, people argue about the boundaries instead of labeling. With fewer, too much ends up in the middle.

### What goes where

These are examples, not rules. Your answers will differ, and that's the point of doing the exercise yourself.

| Level | Typical examples for a person or small team |
|---|---|
| RESTRICTED | Password manager exports and recovery codes, encryption keys, identity documents, anything that would let someone become you or empty an account |
| SENSITIVE | Tax returns, bank and medical records, contracts, private correspondence, customer data |
| INTERNAL | Home address, personal calendar, notes and drafts, everyday email |
| PUBLIC | Published articles, a public profile, released code |

> [!TIP]
> If you can't decide between two levels, pick the higher one. You can lower a classification later. You can't un-leak something.

## Control markings

Control markings add rules on top of the classification. There are three kinds.

### Compartments: who may access it

A **compartment** restricts access to a specific group, whatever their general level of trust. Access needs both: the right classification *and* membership of the compartment.

For example, `SENSITIVE//FIN` means the item is sensitive *and* only the people in the finance compartment may see it. Someone you trust with your medical letters still doesn't automatically see your accounts.

| Compartment | Short form | Who it's for |
|---|---|---|
| FINANCE | FIN | Whoever handles money and accounts |
| HEALTH | MED | Yourself and named family or carers |
| LEGAL | LGL | Yourself and your lawyer |
| A PROJECT | (a short code) | The people on one project |

Keep the list short. A compartment is only useful if you know, without looking it up, who is inside it.

### Handling controls: how it is stored and moved

**Handling controls** say how the data must be kept.

| Handling control | Short form | What it requires |
|---|---|---|
| ENCRYPTED | ENC | Stored only on encrypted disks, volumes or containers |
| PROVIDER-BLIND | BLIND | Stored with a provider only if the provider cannot read it, because you hold the keys |
| END-TO-END | E2E | Sent only over channels encrypted from sender to recipient |
| OFFLINE | OFF | Kept on media that is not connected to a network |
| DESTROY AFTER USE | DAU | Deleted or shredded once it has been read or used |

These are concrete, and that is why they help. "Be careful with this" is advice. `E2E` is a rule you can check: was it sent over an end-to-end encrypted channel, yes or no?

### Sharing controls: how it may be passed on

**Sharing controls** restrict how the data may be shared, *whatever the recipient's trust level*. Even someone fully trusted must follow them.

| Sharing control | Short form | What it means |
|---|---|---|
| NO THIRD PARTIES | NO3P | Do not give to outside services or organizations, including cloud and online tools |
| NO FORWARDING | NOFWD | The recipient may read it but not pass it on |

`NO3P` is stricter than it looks. Uploading a file to a cloud service you don't control is sharing it with a third party. So is pasting it into an online tool or a chatbot.

> [!NOTE]
> Handling and sharing answer different questions. `BLIND` says a provider may store the data, as long as it can't read it. `NO3P` says no outside service gets the data at all, encrypted or not. When they conflict, the stricter one wins.

## Labeling

A label only works if the right people see it. Put labels where they look: the header and footer of documents, slides and similar media, and the name of a file or folder.

A label has this structure:

```text
[CLASSIFICATION]//[COMPARTMENT]//[CONTROLS]
```

The rules:

- The classification is required. Everything else is optional.
- Use the full words or the short forms. Both are valid.
- Separate each category with a double slash: `//`.
- Separate several controls in the same category with a comma: `,`.

Some examples:

```text
PUBLIC
INTERNAL
SENSITIVE//FIN
SENSITIVE//E2E,DAU
RESTRICTED//LGL//OFFLINE,NO FORWARDING
R//LGL//OFF,NOFWD
```

Read the second-to-last one aloud: "Restricted, legal compartment, keep offline, do not forward." The last line is the same label in short form. Once you're used to the format, a label tells you the whole handling story in one line.

## Labels leak too

A label is information. Treat it that way.

- **Labels on the outside point at the inside.** A file named `RESTRICTED//LGL` on a shared drive tells everyone that something sensitive and legal exists. Keep the detailed label inside the encrypted container, and give the container a dull name.
- **Don't color-code what leaves the house.** A bright sticker on a laptop or a backup drive tells a thief which one to take. For portable devices, put the label inside the case, on the encrypted volume, or in your inventory, not on the outside.
- **Don't publish your real scheme.** If your level names and codes are unusual and public, anyone who later finds one of your labels can read it, and a leaked file with your markings can be traced back to you. Use this template as a starting point, then rename the levels and codes to something of your own, and keep that list to yourself and the people who use it.

## Classifying devices and networks

The rule that a device takes the highest level of the data it holds sounds simple, but it has consequences:

- A laptop that holds one RESTRICTED file is a RESTRICTED laptop. Treat its loss accordingly.
- A backup drive takes the highest level of anything backed up to it.
- A network carries the level of the most sensitive traffic on it, unless that traffic is encrypted end to end.

That is often the most useful result of the whole exercise. You find that one sensitive file has raised the level of a device you treat casually, and you decide whether to move the file or to protect the device.

## Getting started

You don't need to label everything on day one. Start where the harm is highest:

- [ ] Decide whose damage you're measuring: yours, your household's or your organization's.
- [ ] Rename the levels and codes in this template to your own, and keep that list private.
- [ ] Find your RESTRICTED items first. There are usually few, and they matter most.
- [ ] Give each of them handling controls, and check that they actually meet them.
- [ ] Record the level of every device and drive in your inventory, using the highest level it holds.
- [ ] Define two or three compartments, at most.
- [ ] Label new documents as you create them. Older material can wait until you next touch it.

## Why bother

A classification system doesn't make anything secure by itself. What it does is make decisions visible. Without one, every "can I put this in the cloud?" or "can I email this?" is a fresh judgment, made in a hurry. With one, you make the judgment once, write it on the label, and follow it.

It also gives you a shared language with the people you work with. "This is SENSITIVE//E2E" is shorter and clearer than a paragraph of instructions, and nobody has to guess what you meant.
