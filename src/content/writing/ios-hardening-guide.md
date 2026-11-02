---
title: "iOS hardening, with the reasons"
description: "A settings-by-settings checklist for an iPhone you depend on, and a one-line reason for every setting, so you can judge what fits your own risk."
date: 2025-04-19
updated: 2026-01-24
pillar: security
tags: ["ios", "iphone", "privacy", "hardening"]
toc: true
---

Most iPhone hardening guides are lists of switches. Lists age badly. Apple renames and moves menus every year, and a setting without its reason is hard to judge when it moves. This version keeps the checklist from the first edition but adds a reason under each item, so you can decide what fits your own risk. Check items off as you go.

> [!NOTE]
> This guide is for everyday users who want sensible privacy and security. If someone with resources may be targeting you, go to [Lockdown Mode](#lockdown-mode) first, then read the further reading at the end.

The settings are opinionated. Where a setting costs you a feature, the reason says so. Paths are for iOS 26.2 in English. If a label on your phone is different, use the search field at the top of the Settings app.

## Before you start

Update first. Several settings below only exist on current versions of iOS. Open `Settings` → `General` → `Software Update` and install anything that is waiting.

Then decide what you are protecting against. For most people it is three things: a thief who gets the phone, apps and advertisers that collect more than they need, and scams that arrive by message. Each setting below helps with at least one of these.

## General

### Software Update

`Settings` → `General` → `Software Update` → `Automatic Updates`

- [ ] iOS Updates, download and install: `On`\
  Most attacks on iPhones use flaws that Apple has already fixed. The time between a fix and your install is the risk.
- [ ] System Files: `On`\
  Lets the phone take smaller updates to system data files without you asking.

### AirDrop

`Settings` → `General` → `AirDrop`

- [ ] AirDrop: `Receiving Off`\
  Strangers nearby can't send you files or images. Switch to `Everyone for 10 Minutes` when you need it; it switches back by itself.
- [ ] Bringing Devices Together: `Off`\
  Stops contact details being offered just because two phones are held close together.
- [ ] Use Cellular Data: `Off`\
  Keeps AirDrop local. With this on, a transfer can continue over the internet after you walk out of range.

### AirPlay & Continuity

`Settings` → `General` → `AirPlay & Continuity`

- [ ] Automatically AirPlay: `Never`\
  Your phone won't start sending audio or video to a nearby TV or speaker that you did not choose.
- [ ] Transfer to HomePod: `Off`\
  Only useful if you own a HomePod. Otherwise it is one less nearby-device feature switched on.
- [ ] Handoff: `Off`\
  Stops what you are doing on the phone appearing on your other Apple devices. Leave it on if you rely on it with a Mac you trust.
- [ ] Continuity Camera: `Off`\
  Stops a nearby Mac using the phone as its camera. Turn it on when you want it.
- [ ] AirPlay Receiver: `Off`\
  One less service waiting for connections on the local network.

## Face ID and passcode

These settings protect you when someone else is holding your phone. They matter most against theft. Many of the most damaging iPhone thefts start with a thief who watched you type your passcode.

### Passcode

`Settings` → `Face ID & Passcode` → `Change Passcode` → `Passcode Options`

- [ ] Passcode: `Custom Alphanumeric Code`\
  A six-digit code has one million combinations, and forensic tools are built to guess short numeric codes. A short phrase is much harder to guess and harder to read over your shoulder.
- [ ] Erase Data after 10 failed attempts: `On`\
  If someone keeps guessing, the phone wipes itself. Skip this if a child is likely to play with your phone, and keep a current backup either way.

### Face ID

`Settings` → `Face ID & Passcode`

- [ ] Face ID: `On`\
  Face ID means you type your passcode less often in public, so fewer people see it. Stolen Device Protection, below, also depends on it.
- [ ] Require Attention for Face ID: `On`\
  The phone only unlocks when your eyes are open and looking at it, not when you are asleep or looking away.

### Stolen Device Protection

`Settings` → `Face ID & Passcode` → `Stolen Device Protection`

- [ ] Stolen Device Protection: `On`\
  Away from familiar places, saved passwords and payment cards need Face ID, with no passcode fallback. A thief who knows your passcode still can't use them.
- [ ] Require Security Delay: `Always`\
  Changing your Apple Account password, your passcode or Face ID then needs Face ID, a wait of about an hour, and Face ID again. `Always` applies this at home too, so a thief can't skip the wait by being somewhere the phone thinks is familiar.

> [!TIP]
> Stolen Device Protection needs iOS 17.3 or later and Face ID or Touch ID. Apple's support page lists every action it protects. The link is at the end.

### Allow access when locked

`Settings` → `Face ID & Passcode` → `Allow Access When Locked`

- [ ] Control Center: `Off`\
  Stops someone switching on Airplane Mode from the Lock Screen, which would cut the phone off from Find My before you can track it.
- [ ] Accessories: `Off`\
  Once the phone has been locked for an hour, cables and accessories can charge it but can't open a data connection to it.
- [ ] Everything else on this screen: `Off` unless you use it\
  Each item here is something a person holding your locked phone can do without your passcode.

## Privacy & Security

`Settings` → `Privacy & Security`

### Location Services

- [ ] Each app: `Never` or `While Using`\
  Very few apps need your location when you are not using them. Choose `Ask Next Time` if you are not sure.
- [ ] Precise Location: `Off` for apps that don't need it\
  A weather or news app works fine with your rough area. Save precise location for maps and ride apps.
- [ ] System Services → iPhone Analytics: `Off`\
  Stops location being included in the diagnostic data sent to Apple.
- [ ] System Services → Routing & Traffic and Improve Maps: `Off`\
  These send your movements to Apple to improve Maps. Useful to Apple, not needed by you.
- [ ] System Services → Status Bar Icon: `On`\
  Shows an arrow in the status bar when system services use your location, so you can see when it happens.

### Tracking

- [ ] Allow Apps to Request to Track: `Off`\
  Apps are told "no" automatically when they ask to track you across other companies' apps and websites. You won't be asked again.
- [ ] Apps listed on this screen: `Off`\
  Withdraws permission from any app you allowed earlier.

### Analytics & Improvements

- [ ] Share iPhone & Watch Analytics: `Off`\
  Stops diagnostic and usage data going to Apple. It also stops crash data going to app developers.
- [ ] Share iCloud Analytics: `Off`\
  Stops usage data from your iCloud account being shared to improve Apple's services.
- [ ] Improve Siri & Dictation: `Off`\
  Apple won't keep audio recordings of your Siri and dictation requests for review.
- [ ] Every other "Improve" switch on this screen: `Off`\
  Each one shares a different kind of usage data. None of them helps you.

### Apple Advertising

- [ ] Personalized Ads: `Off`\
  Apple's own ads, in the App Store and some Apple apps, stop using your account information to target you. You still see ads; they are just less personal.

### Security

These are under the Security heading near the bottom of `Privacy & Security`.

- [ ] Background Security Improvements → Automatically Install: `On`\
  From iOS 26.1, Apple can ship small security fixes between full updates. With this on, they install without waiting for you.
- [ ] Wired Accessories: `Ask for New Accessories`\
  On a USB-C iPhone, a new cable, charger or computer has to be approved before it can talk to the phone. This blocks "juice jacking" from public charging ports. Choose `Always Ask` if you plug into a lot of unfamiliar hardware. Lightning iPhones only have the two `Allow` options.

### Other permissions

- [ ] App Privacy Report: `On`\
  Shows which apps used your camera, microphone, location, photos and contacts, and which domains they contacted, over the last seven days. You can't fix what you can't see.
- [ ] Photos, Contacts, Microphone, Camera, Bluetooth, Local Network: review each\
  Remove access from any app that does not need it. Where iOS offers limited access, such as selected photos or contacts, use it.
- [ ] Safety Check: run it once\
  It walks through who you share location, photos and other data with, and which devices are signed in to your account. Run it again after a breakup or a lost device.

## Siri and Search

### Siri

`Settings` → `Apple Intelligence & Siri` (on iPhones without Apple Intelligence, `Settings` → `Siri`)

- [ ] Talk & Type to Siri → Listen for: `Off`\
  Siri only starts when you choose to start it, so fewer accidental activations send audio off the phone.
- [ ] Press Side Button for Siri: `Off`\
  If you don't use Siri, this stops it being started from the Lock Screen by anyone holding the phone.
- [ ] Allow Siri When Locked: `Off`\
  Siri can read messages, make calls and change some settings. None of that should work without your passcode.
- [ ] Siri & Dictation History: `Delete Siri & Dictation History`\
  Removes the requests and transcripts Apple has stored for your device.
- [ ] ChatGPT extension: `Off` unless you use it\
  When it is on, Siri can pass some requests to OpenAI. Turn it on only if you want that, and read OpenAI's terms first.
- [ ] Suggestions: Allow Notifications, Show in App Library, Show When Sharing, Show Listening Suggestions: `Off`\
  This learning happens on the phone, so the gain is mostly about what appears on screen, not data leaving it. Turn them off if you share your screen or hand your phone to others.

### Search

`Settings` → `Search`

- [ ] Show Recent Searches: `Off`\
  Your past searches don't appear to anyone who picks up the phone and swipes down.
- [ ] Show Related Content: `Off`\
  Fewer suggestions based on what you have searched for before.
- [ ] Help Improve Search: `Off`\
  Stops what you search for being sent to Apple to improve search.

## Safari and Messages

### Safari

`Settings` → `Apps` → `Safari`

- [ ] Search Engine: `DuckDuckGo`\
  Your searches are not tied to an advertising profile. The first edition put this under Search; it lives here, under Safari.
- [ ] Search Engine Suggestions and Safari Suggestions: `Off`\
  Stops what you type in the address bar going to the search engine and to Apple as you type it.
- [ ] Prevent Cross-Site Tracking: `On`\
  Blocks the cookies that let one site follow you across others.
- [ ] Hide IP Address: `Trackers and Websites`\
  Hides your IP address, a number that shows your rough location, from trackers, and from websites too if you pay for iCloud+. Without iCloud+, choose `Trackers Only`.
- [ ] Fraudulent Website Warning: `On`\
  Safari warns you before you open known phishing sites. It checks a coded fragment of the address, not the full address. Some privacy guides turn this off. I keep it, because phishing is a far more common threat than the lookup.
- [ ] Advanced → Advanced Tracking and Fingerprinting Protection: `All Browsing`\
  Makes it harder for sites to identify your phone from small details of its setup, a method called fingerprinting. Check it says `All Browsing`, not only Private Browsing.

### Messages

`Settings` → `Apps` → `Messages`

- [ ] Screen Unknown Senders: `On`\
  Messages from numbers that are not in your contacts go to a separate list without notifications. Most text-message scams come from unknown numbers.
- [ ] Filter Spam: `On`\
  Moves likely spam out of your main list.

## Notifications

`Settings` → `Notifications`

- [ ] Show Previews: `When Unlocked`\
  Message text and one-time codes don't appear on the Lock Screen, where anyone holding the phone can read them.

## Apple Account and iCloud

`Settings` → your name

### Find My

`Settings` → your name → `Find My` → `Find My iPhone`

- [ ] Find My iPhone: `On`\
  Lets you locate, lock or erase a lost phone. It also turns on Activation Lock, which makes a stolen phone much less valuable.
- [ ] Find My network: `On`\
  Lets the phone be found even when it is offline, through other Apple devices nearby.
- [ ] Send Last Location: `On`\
  Sends Apple the phone's location when its battery is almost empty.

### Advanced Data Protection

`Settings` → your name → `iCloud` → `Advanced Data Protection`

- [ ] Advanced Data Protection: `On`\
  End-to-end encrypts most of iCloud, including backups, photos and notes. Without it, Apple holds the keys to that data and can be compelled to hand it over.
- [ ] Recovery contact or recovery key: set up before you turn it on\
  With Advanced Data Protection on, Apple can't recover your data for you. Store the recovery key offline, somewhere you will find it in five years.

> [!CAUTION]
> Apple stopped offering Advanced Data Protection to new users in the United Kingdom in February 2025. If you are in the UK and don't see the option, that is why.

### Security keys

`Settings` → your name → `Sign-In & Security` → `Security Keys`

- [ ] Security keys: optional, two keys\
  A hardware security key replaces the six-digit code for signing in to your Apple Account, and it can't be phished. You need two, so one can be a backup. Worth it if your Apple Account protects a lot.

## Cellular

`Settings` → `Cellular` → `SIM PIN`

- [ ] SIM PIN: `On`\
  If your SIM is removed and put in another phone, it can't be used to receive your calls and text-message codes without the PIN. Get your carrier's default PIN first. Three wrong guesses lock the SIM until you enter the PUK code from your carrier.

## Habits that matter as much as settings

- **Restart the phone now and then.** After a restart, your data stays encrypted until you type your passcode. Some spyware does not survive a restart. Security researchers found that since iOS 18.1, an iPhone that has not been unlocked for about three days restarts by itself, which has the same effect.
- **Install updates the day they arrive.** Automatic updates can take days to reach you. When Apple says a flaw "may have been actively exploited", update by hand.
- **Delete apps you don't use.** Every app is code you trust with some access. Fewer apps, less to go wrong.
- **Use a password manager and passkeys.** Strong, unique passwords for every account matter more than any switch on this page.

## Lockdown Mode

> [!WARNING]
> Lockdown Mode breaks things on purpose. Most message attachments, link previews, some web fonts and complex web features, FaceTime calls from people you have not called before, and shared photo albums stop working. Try it for a week before you decide to keep it.

Lockdown Mode is Apple's extreme protection for people who may be targeted by mercenary spyware: journalists, activists, people in sensitive negotiations, or anyone who has received a threat notification from Apple. It removes the features that commercial spyware has used most often to get in.

When it is on, among other things:

- Messages blocks most attachment types other than some images, and shows no link previews.
- Safari blocks some complex web technologies, so some sites load slowly or look wrong.
- FaceTime blocks incoming calls from people you have not called before.
- Shared albums are removed from Photos.
- The phone must be unlocked to connect to an accessory or computer.
- Configuration profiles can't be installed and the phone can't be enrolled in device management.
- 2G cellular support is turned off, and the phone won't join non-secure Wi-Fi networks automatically.

Phone calls, plain text messages and emergency features still work.

To turn it on: `Settings` → `Privacy & Security` → `Lockdown Mode` → `Turn On Lockdown Mode`. The phone restarts. You can exclude a website or app you trust if it breaks, but every exclusion weakens the protection.

## If your risk is higher

The checklist above is for everyday risk. If you face a capable adversary, also consider:

- **Lockdown Mode**, above, from day one.
- **A separate phone** for sensitive work, bought without linking it to your name, and used without your main Apple Account.
- **Fewer cloud services.** Every service you sign in to holds data that someone can request, subpoena or steal.
- **Expert help.** The Electronic Frontier Foundation's Surveillance Self-Defense guide, linked below, is a good start. If you are a journalist or activist and think you are targeted, organizations such as Access Now run digital-security helplines.

## What changed from the first edition

- Every setting now has a reason.
- Added: Stolen Device Protection with `Always`, Lock Screen access, Wired Accessories, Background Security Improvements, Safari, Messages, notification previews, Find My, Advanced Data Protection, security keys, SIM PIN and Lockdown Mode.
- Moved the search engine setting to Safari, where it actually lives.
- Updated paths for iOS 26: Siri is under `Apple Intelligence & Siri`, and app settings are under `Settings` → `Apps`.
- Fixed typos, including "AirPlay & Continuity" and a duplicated update setting.

## Further reading

- [Apple Platform Security guide](https://support.apple.com/guide/security/welcome/web): how the Secure Enclave, data protection and the rest work underneath these settings.
- [About Lockdown Mode](https://support.apple.com/105120): Apple's full list of what Lockdown Mode restricts.
- [About Stolen Device Protection for iPhone](https://support.apple.com/120340): every action that needs Face ID or the security delay.
- [Allow USB and other accessories to connect to your iPhone or iPad](https://support.apple.com/111806): the Wired Accessories options.
- [About Background Security Improvements](https://support.apple.com/102657)
- [How to turn on Advanced Data Protection for iCloud](https://support.apple.com/108756)
- [Apple Personal Safety User Guide](https://support.apple.com/guide/personal-safety/welcome/web): Safety Check and how to review who can see your data.
- [EFF Surveillance Self-Defense: Get to know iPhone privacy and security settings](https://ssd.eff.org/module/how-to-get-to-know-iphone-privacy-and-security-settings)
- [iOS Hardening Guide by iAnonymous3000](https://github.com/iAnonymous3000/iOS-Hardening-Guide): a longer community guide.
