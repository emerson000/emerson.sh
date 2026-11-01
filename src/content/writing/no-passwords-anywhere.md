---
title: "No passwords anywhere"
description: "How I removed passwords from every sign-in path of my project's single sign-on, the trade-offs I accepted, and the rule I reversed a day later."
date: 2026-10-14
pillar: security
tags: [identity, passkeys, authentik, mfa, sso]
layout: standard
toc: true
---

On 10 October 2026 I removed passwords from the single sign-on service for my independent project, Covert Signals. No sign-in flow asks for a password now. No flow sets one or accepts one.

This post covers the decisions behind that change. The configuration matters less than the trade-offs. Every choice here gives something up, and I want to be clear about what.

## The setup

The identity provider is [Authentik](https://goauthentik.io), an open-source single sign-on server. I host it myself, and the project's apps sign in through it. Authentik builds sign-in out of **flows**, which are ordered lists of **stages** (ask for an email, check a code, deny, log in). **Policies** decide whether each stage runs.

Before the change, sign-in was a common pattern: email, then password, then one second factor. Recovery was the usual public "forgot password" link: enter your email, click a link, set a new password.

## The goal

The goal fit in one sentence: remove passwords from every path of the service. That means sign-in, invitations, recovery, account settings, and the administrator account. A password that only exists on one forgotten path is still a password someone can phish, reuse or guess.

## Four decisions

I wrote the decisions down before any configuration. Each one is a trade-off.

| Topic | Decision |
|---|---|
| Sign-in | A passkey or security key, with user verification, signs in alone. Without one, the user must pass an authenticator-app code **and** an email code. |
| Lost access | Administrator only. No public self-service recovery. |
| Migration | Hard cutover. No period where passwords and passkeys both work. |
| Break-glass | The administrator account is passwordless too. |

### Sign-in: a passkey alone, or two weaker things together

A **passkey** is a WebAuthn credential: a key pair bound to the site, kept on a device or a hardware security key. "User verification" means the device checks a PIN or biometric before it signs. A passkey resists phishing because the browser will only use it on the real site. That makes it strong enough to stand alone.

An authenticator-app code (TOTP, a time-based one-time password) is weaker. A good fake login page can relay it in real time. So is an email code. I decided that neither should sign in alone. Together they are two separate things an attacker has to get: the phone and the mailbox.

The order matters too. The email code goes out only after a correct app code, so nobody can use the sign-in page to flood that person's mailbox.

### Lost access: an inbox alone never recovers an account

Public recovery is where many careful setups fall apart. If "forgot password" sends a link to your inbox, your account is only as strong as your email. With passwords gone, a public recovery flow would be worse: it would be the easiest way in.

So I removed public recovery. If someone loses their methods, an administrator checks who they are through a channel outside the identity system, then issues a one-time, short-lived link. The link makes them set up a new passkey or authenticator app. A visitor who opens the recovery page without a link gets a denial.

The cost is administrator time. Every lost phone is now a manual, verified recovery. I accept that, and I ask everyone to register two methods: two passkeys, or a passkey and an authenticator app.

### Migration: a hard cutover, in two steps

Running passwords and passkeys side by side for a while sounds gentler. It also means the password path stays open, and the password path is the thing I wanted gone. So I chose a hard cutover, split by reversibility:

1. **Switch the flows.** This step is reversible. If something breaks, I deploy the previous configuration, and the password hashes are still intact.
2. **Destroy the password hashes**, about a week later. This step is not reversible. Each account gets an unusable password.

Before step 1, I audited every account read-only. Which ones would still be able to sign in under the new rules? Which ones needed a method added while passwords still worked? I also rehearsed the whole change on a local stack first, including both break-glass paths.

In testing, destroying the hashes did not end anyone's session, so the second step needs no sign-out.

### Break-glass: no exception for the administrator

It is tempting to keep one strong password for the administrator "just in case". That password would be the most valuable secret in the system, so it is not there. The administrator account signs in like every other account. The plan calls for two passkeys on separate devices. If those are lost, recovery goes through access to the server itself, which already holds the keys to everything else. I also removed the bootstrap password that a fresh install would set.

## What testing found

I tested each rule against a real Authentik instance, not just against the design. One finding changed the design.

An Authenticator Validation stage only *offers* the device types you configure. But it checks a submitted code against *every* device the user has. With my first design, a TOTP user could enter two TOTP codes in a row, one at each stage, and sign in without ever touching email. A leftover email code also passed the first stage.

The fix was a final Deny stage after the two code stages. Its policy ignores which stages ran. It looks at the list of devices the user actually proved and denies unless that list is a passkey of this user, or a TOTP device and an email code for the account's current address. Simplified, and as it stood after the change in the next section, it reads like this:

```python
# True denies. Check what was proved, not which stages ran.
proved = {type(d).__name__ for d in validated_devices_of(pending_user)}

if "WebAuthnDevice" in proved:
    return False                      # a passkey is enough
if {"TOTPDevice", "EmailDevice"} <= proved:
    return False                      # both weaker factors
if "EmailDevice" in proved and not has_passkey_or_totp(pending_user):
    return False                      # email-only account (see below)
return True                           # anything else, or any doubt, denies
```

The real policy also checks that each device belongs to the user and that an email device matches the account's current address. Every policy in these flows fails closed: if it errors, the stricter path runs or the user is denied. Live tests now cover both attacks.

> [!TIP]
> If you build multi-step sign-in in Authentik, don't assume "stage two ran" means "factor two was proved". Check the validated devices at the end.

Two smaller findings:

- **Step-up must equal sign-in.** Account settings that re-check identity, such as changing an email address or adding a method, used to accept any single factor, including an email code alone. They now ask for exactly what sign-in asks for.
- **Changing the email address must move the email-code device.** The email code is now part of signing in. If the device kept sending codes to the old address, the old mailbox would keep half of the account.

## The rule I reversed a day later

The first design said "an email code is never sufficient alone". That was stricter than my goal. My goal was to remove passwords, not to require a phone or a security key from everyone.

The cutover made the cost visible. Several accounts held only a confirmed email-code device. Under the new rules, they were refused before any code was sent. I had seen this in the audit and had planned to send each of those people a recovery link. What I had not asked was whether locking them out served the goal. It didn't.

So on 10 October I changed one rule:

| The account has | Sign-in |
|---|---|
| A passkey or security key | The passkey alone |
| An authenticator app, no passkey | The app code, then an email code |
| Neither, but an email-code device for its current address | The email code alone (new) |
| An authenticator app but no email-code device | Refused |
| No method | Refused |

"Fallback" is the important word. The email code stands alone only while the account has nothing stronger. It is not a second option for someone who has a passkey or an authenticator app. If they lose that, they still need an administrator.

This change did not remove any stage. It added one policy and changed two. The final proof check, the one from the testing section, still reads the account's devices fresh at that moment. It does not trust that an earlier stage was skipped for a good reason.

## How I weighed the trade-offs

Every recovery path is an attack path, and every convenience is one too. Removing passwords doesn't remove that. It moves the question to each remaining path. These are the general costs I weighed. They apply to any passwordless design like this one, not only to mine.

- **A fallback is only as strong as what it falls back to.** An email-code fallback makes the mailbox the account for anyone who relies on it. I accepted that for accounts with nothing stronger, and I made the stronger methods the default: invitations still ask for a passkey or an authenticator app.
- **Self-service removal is a downgrade path.** If people can remove a factor, they can turn a strong account into a weak one, and so can anyone who has stolen their session. Decide which removals need a fresh proof, and don't let the interface offer a removal that leaves the account unable to sign in.
- **Order is a control.** Which factor comes first decides what an attacker can trigger before proving anything. Put the factor that costs you nothing to check first, and send messages to a person only after it.
- **Manual recovery costs time, and that's the point.** A human check through a second channel is slower than a reset link. It is also the one step that a stolen inbox can't pass.
- **Upgrades can bring stock defaults back.** I disabled the stock flow definitions that include a password stage, and a checker fails if any flow has a password stage or prompt. I run it after every upgrade.

## The portal follows the same rule

The account portal lets people add and remove methods. Its old rule was "you can't remove your last method". That is wrong under this design, because an authenticator app and email codes need each other. The new rule is "the methods that remain must still be able to sign in". The portal never offers a removal that would lock the account. It is stricter than Authentik, never looser, so Authentik can change first and the portal can follow.

## What I'd do again, and what I'd do differently

I'd write the decisions table first again. It turned a pile of configuration into four choices I could defend. I'd split the cutover by reversibility again. And I'd test the flows against a real instance before trusting a design, because the two-TOTP-codes problem was invisible on paper.

What I'd do differently: test each strict rule against the goal, not only against the account list. "Never sufficient alone" sounded like good security. For the accounts it hit, it only meant they couldn't sign in. The fix took a day, and the trade-off it brought back is now written down where I can see it.
