---
title: "Ransomware-proof backups, tested"
description: "Five questions about Kopia and Backblaze B2 Object Lock, how I tested each one, what happened, and the controls I put into production."
date: 2026-09-27
pillar: security
tags: [backups, ransomware, kopia, backblaze, object-lock]
layout: standard
toc: true
---

Most backup advice says "make your backups immutable". Fewer people check that the claim holds when someone actually attacks it. Before I moved the backups for my independent project, Covert Signals, to a new tool, I wanted proof, not a feature list.

So I ran a proof of concept on 22 September 2026. I gave myself five questions, tried to break the setup in the ways ransomware would, and wrote down what happened. This post is that test: the questions, the method, the results, and the controls that went into production.

## The setup in one paragraph

The services run on a self-hosted deployment platform. The backups go to Backblaze B2, a cloud object store, through its S3-compatible interface. The backup tool is [Kopia](https://kopia.io), an open-source program that encrypts, deduplicates and snapshots data before upload. The protection comes from B2 **Object Lock**: a bucket feature that stops anyone from deleting or overwriting an object version until a retention date passes.

Object Lock has two modes. In **governance** mode, a key with a special permission (`bypassGovernance`) can still remove the lock. In **compliance** mode, nobody can remove it before the date. Not the client key, not an admin key, not the account owner.

> [!NOTE]
> My first design used restic, another good backup tool. Restic needs delete rights to prune old data, so the plan kept Object Lock off and pushed immutability to a later, separate replica. Kopia supports Object Lock directly and can extend locks as it runs. That made the simpler design possible, if it worked. The test was there to find out.

## The five questions

I wrote these down before I ran anything:

1. Can the backup machine work with a B2 key that has no permission to delete?
2. Does compliance retention stop deletion even by a privileged admin key?
3. If ransomware removes snapshots from Kopia's current view, can I still get them back?
4. Does Kopia's maintenance extend the lock deadlines, so that old data stays protected?
5. Can Kopia verify and restore all of the test data, byte for byte?

## Method

I used a throwaway private bucket with Object Lock turned on and **no default bucket retention**. That last point matters: Kopia sets the retention on each object it writes, so the bucket default stays empty.

The test used the current Kopia release, checked against its published SHA-256 digest, and Backblaze's own command-line tool. The test data was three small files with known content, 292 bytes in total. Small data keeps the test about the controls, not about throughput.

The client key was limited to that one bucket. These were its capabilities:

```text
listBuckets
readBuckets
listFiles
readFiles
writeFiles
readBucketEncryption
readBucketReplications
readBucketRetentions
readFileRetentions
writeFileRetentions
readFileLegalHolds
```

It did **not** have `deleteFiles`, `deleteBuckets` or `bypassGovernance`. It expired after one day, and I revoked it at the end of the test. The repository password and the key lived in files with mode `0600`, and neither one appeared in command output or in my notes.

Creating a locked repository looks like this. The bucket name and region are placeholders:

```bash
export AWS_ACCESS_KEY_ID='<restricted-key-id>'
export AWS_SECRET_ACCESS_KEY='<restricted-application-key>'

kopia repository create s3 \
  --endpoint=s3.<region>.backblazeb2.com \
  --bucket=example-kopia-backups \
  --region=<region> \
  --retention-mode=COMPLIANCE \
  --retention-period=48h
```

Kopia reported these repository values:

```text
Encryption: AES256-GCM-HMAC-SHA256
Block hash: BLAKE2B-256-128
Format version: 3
Retention mode: COMPLIANCE
Retention period: 48h
```

> [!TIP]
> I started with a one-day lock and Kopia refused the maintenance settings. Kopia requires the full-maintenance interval to be at least one day shorter than the retention period. With 48-hour locks and a 12-hour maintenance interval, it accepted the setup.

Before the real tests, I ran `kopia repository validate-provider`. It checks that the storage behaves as Kopia expects: listing, missing objects, conditional creation, partial and full reads, metadata, and concurrent access. Every B2 test passed. Be aware that it is not free. Its 30-second concurrency test left 222 object versions and about 432 MB in the bucket before cleanup. With Object Lock on, you can't delete those right away either.

## Results

### Question 5 first: a known-good baseline

I took a snapshot of the three files and tagged it as the good run. Then I verified it, reading every file:

```bash
kopia snapshot verify --verify-files-percent=100
```

Kopia read and verified all three files. I restored them into an empty staging directory, and a recursive comparison with the source showed no differences. I wrote down the time just after the snapshot. I would need it later.

### Question 1: the restricted key can't delete

I picked one repository object, Kopia's `kopia.blobcfg` file. B2 reported compliance retention on it. With the restricted client key, I tried to permanently delete that exact file version by its ID.

B2 refused. The command exited with status 1 because the key had no delete permission. A read straight after the attempt succeeded. The object was still there.

### Question 2: the admin key can't delete either

This is the test that matters most. A restricted key is only one layer. If an attacker gets an account-wide key, permissions alone won't save you.

I took an existing admin key that has `deleteFiles`, `deleteBuckets` and `bypassGovernance`, and tried to permanently delete the same file version. B2 returned `Access Denied`. The read afterwards succeeded.

So compliance retention blocked deletion by a caller that held every normal delete permission and the governance bypass. That is the property I wanted.

### Question 3: a simulated attack, then recovery

Next I acted like ransomware that knows about backups:

1. I replaced all three source files with fake encrypted content.
2. I took a new snapshot, so the "corrupt" state was now backed up too.
3. I deleted the known-good snapshot through Kopia.

After that, Kopia's current view showed one snapshot: the corrupt one. The good snapshot was gone from view.

Then I recovered. I made a separate Kopia configuration, connected to the same repository in read-only mode, and asked for the repository as it was at the time I wrote down:

```bash
kopia repository connect s3 \
  --config-file=/tmp/pit/repository.config \
  --endpoint=s3.<region>.backblazeb2.com \
  --bucket=example-kopia-backups \
  --region=<region> \
  --readonly \
  --point-in-time=2026-09-22T13:03:32Z
```

The point-in-time view found the deleted snapshot by its exact ID. I verified 100 percent of its files and restored them. A recursive comparison matched the original known-good restore. The attack removed the snapshot from the current view, but it did not destroy the recovery point.

This works because "deleting" in Kopia, on a locked bucket, only hides object versions. The old versions stay in B2 under their locks, and Kopia knows how to read a past state of the repository from them.

### Question 4: maintenance extends the locks

A lock that never moves is a problem. Data you still need, such as old content that newer snapshots still point to, would lose its protection when the original date passes. Kopia handles this in full maintenance, if you turn it on:

```bash
kopia maintenance set \
  --enable-full=true \
  --full-interval=12h \
  --extend-object-locks=true
```

I recorded the lock deadline on the sample object, ran full maintenance by hand, and read it again:

| | Retention deadline |
|---|---|
| Before maintenance | `2026-09-24T13:03:27Z` |
| After maintenance | `2026-09-24T13:09:32Z` |

The deadline moved forward by about six minutes (364,641 milliseconds). The new deadline is 48 hours from the maintenance run instead of 48 hours from the original write. Small, but it proves Kopia renewed the compliance lock. Maintenance completed, found five unused contents that were too recent to delete, and kept all the data it needed.

### Summary

| Question | Result |
|---|---|
| Backups work with a no-delete key | Pass |
| Compliance lock stops an admin key | Pass |
| Point-in-time recovery after snapshot deletion | Pass |
| Maintenance extends lock deadlines | Pass |
| Full verify and byte-for-byte restore | Pass |

Overall: pass, with production controls.

## What the test did not prove

Passing tests are easy to over-read. These are the limits I wrote down:

- **Object Lock protects availability, not confidentiality.** Anyone with the repository password and the client key can read and copy the backups. Encryption and key handling still matter.
- **A key that can write can run up a bill.** Any key that can upload data and set retention can also upload a lot of locked data that nobody can delete for weeks. Object Lock can't prevent that kind of cost attack. Billing alerts and a quick response are the answer.
- **Maintenance is now a security control.** If maintenance stops for longer than the retention period, data that is still needed can lose its lock. A missed maintenance run is a security event, not a housekeeping issue.
- **Recovery depends on hidden versions staying around.** The lifecycle rule that removes hidden versions must wait longer than it would take to notice an attack.
- **Two days is a test value.** I used short locks only to keep the test cheap. It is not enough for production.

Cleanup also taught me something. When the test ended, I hid all 26 remaining objects, and a listing of current objects came back empty. But the hidden versions stayed in the bucket under their locks, and I could not delete the bucket until the last lock expired two days later. Plan for that when you test compliance mode.

## The production controls

The test supported a switch from restic to Kopia. These are the production controls that came out of it:

- A dedicated private bucket with Object Lock, used by nothing else.
- No default bucket retention. Kopia sets compliance retention per object.
- A 35-day compliance period (`--retention-period=840h`).
- A lifecycle rule that deletes hidden versions 35 days after they are hidden.
- A bucket-restricted client key without `deleteFiles`, `deleteBuckets` or `bypassGovernance`.
- No account-wide B2 key on the machine that runs the backups.
- Full maintenance every 24 hours, with lock extension on.
- A check that flags any eight-hour gap without a successful backup, and any 30-hour gap without successful full maintenance.
- Retention of the latest 8 snapshots, 14 daily, 8 weekly and 12 monthly.
- MFA on the Backblaze account, and unused account-wide keys removed.
- A quarterly restore into an isolated environment, including one point-in-time restore.

Thirty-five days is my minimum, not a magic number. If you think detection could take longer, set a longer lock. Don't plan to shorten it later: Kopia can't shorten an active compliance lock, and B2 won't let anything else do it.

The bucket setup on the admin workstation looks like this:

```bash
b2 bucket create \
  --file-lock-enabled \
  --lifecycle-rule '{"daysFromHidingToDeleting":35,"daysFromUploadingToHiding":null,"fileNamePrefix":""}' \
  example-kopia-backups allPrivate

b2 key create \
  --bucket example-kopia-backups \
  kopia-backup-host \
  'listBuckets,readBuckets,listFiles,readFiles,writeFiles,readBucketEncryption,readBucketReplications,readBucketRetentions,readFileRetentions,writeFileRetentions,readFileLegalHolds'
```

> [!WARNING]
> You cannot turn Object Lock off once a bucket has it. Use a bucket that holds only this repository.

The rest of the design did not change. On a fixed schedule, the platform and the databases produce their own backup files: application-aware database dumps and storage archives, never live data directories. The backup job refuses any required file that is missing, empty or more than two hours old. It then snapshots each source and writes a manifest that ties every snapshot in the run to one run ID. A run counts as successful only when that manifest snapshot exists. Restores always go to an empty staging directory first, never straight into live paths.

The production backups went live on 23 September, the day after the test, behind a gate: one manual backup, one isolated restore whose file hashes match the manifest, and only then the timers.

## What I'd tell someone doing this

Write the questions down before you start, and include the one you're afraid of. Mine was "what if they get the admin key". Test with an admin key, not just the restricted one. Simulate the attack in the order a real attacker would do it: corrupt, back up the corruption, then delete the good copies. Record the timestamp you'll need for recovery before you need it.

And treat the parts that keep the protection alive, maintenance and alerts, as security controls. Immutability that quietly expires is just a slower way to lose your backups.
