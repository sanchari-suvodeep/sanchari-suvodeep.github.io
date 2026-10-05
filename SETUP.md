# Setup

Three things to do, in this order. Budget about 30 minutes for all of it.

---

## 1. Where it lives

| | |
|---|---|
| **Live site** | https://sanchari-suvodeep.web.app |
| **Hosting** | Firebase Hosting, site `sanchari-suvodeep`, in the planner's Firebase project `sanchari-suvodeep-wedding` (it's a separate site; guests never see or reach the planner) |
| **Code** | https://github.com/sanchari-suvodeep/sanchari-suvodeep.github.io |

### Publishing a change

```bash
cd ~/Document/repos/wedding_website
git add -A && git commit -m "What changed" && git push     # keeps the code backed up on GitHub
npx firebase-tools deploy --only hosting                    # publishes the site (about 30 seconds)
```

`firebase.json` pins the deploy to the `sanchari-suvodeep` site, so this can never overwrite the planner. Docs and `tools/` aren't uploaded.

> The GitHub repo is also served by GitHub Pages at the `github.io` address. It's the same code, and its RSVPs land in the same place. Once you're sharing the `web.app` link, you can switch Pages off in the repo's Settings → Pages if you'd rather there were only one address.

## 2. RSVPs

Replies save straight into the planner's database (an `rsvps` collection) and appear in the **RSVP inbox** at the top of the planner's **Guests** tab: https://sanchari-suvodeep-wedding.web.app/#guests

From the inbox you **Apply** a reply to a guest (it sets their RSVP and copies their dietary needs, phone and note; a requested song goes into Songs), **Add as new guest**, or **Dismiss** it. Every action can be undone.

What guests can do is limited by the database's security rules (kept in the planner's repo, `firestore.rules`): they can *add* a reply, with every field checked and capped, and nothing else. They can't read anyone's reply or touch the guest list.

There's nothing to set up. The connection details are in `assets/js/config.js` (`rsvpStore`); they only identify the project and aren't secrets.

## 3. Fill in your details

Everything below is plain text — no code knowledge needed. Search the files for
`Edit me` and `todo` to find every spot that still needs you.

### `assets/js/config.js`
The countdown date, the RSVP endpoint, your contact email, the RSVP deadline,
and the music file. Start here.

### `index.html`
Marked with `<!-- EDIT ME -->` comments:

| Section | What to change |
|---|---|
| **Our Story** | A paragraph or two about how you met and the proposal |
| **Itinerary** | The dress code for Saturday's ceremony |
| **Travel & Stay** | Who has a room at the lodge, and where everyone else books |
| **Gallery** | Done — add more any time with `tools/add-photos.py` (see below) |
| **FAQ** | Plus-ones, children, dress code, registry, parking |

To replace a gallery placeholder, drop your photo in `assets/img/` and change
the whole `<div class="shot placeholder …">…</div>` block to:

```html
<figure class="shot fade-in d1">
  <img src="assets/img/your-photo.jpg" alt="A short description" loading="lazy">
</figure>
```

### Adding photos to the gallery

```bash
# one photo, with a description for screen readers and the lightbox
python3 tools/add-photos.py ~/Pictures/us-at-the-lake.heic --alt "Us at the lake"

# a whole folder at once (edit the descriptions in gallery.js afterwards)
python3 tools/add-photos.py ~/Pictures/new-ones

python3 tools/add-photos.py --list            # see what's in the gallery
python3 tools/add-photos.py --remove photo-3  # take one out (deletes its files too)
```

It resizes each photo, makes the WebP copy, keeps the camera's rotation, and
adds a line to `assets/js/gallery.js`. HEIC, AVIF, JPEG and PNG all work. Add
`--front` to put new photos first. Then `git add -A && git commit && git push`
and the live site updates in about a minute.

The order of lines in `gallery.js` is the order photos appear and the order
the lightbox steps through; the page balances them into level columns itself.

### `assets/audio/`
Optional background music — see the README in that folder, including a note on
licensing before you put a commercial recording on a public site.

---

## Previewing locally

```bash
cd /Users/suvodeepmajumder/Document/repos/wedding_website
python3 -m http.server 8777
```

Then open <http://localhost:8777>. Opening `index.html` directly as a `file://`
URL mostly works, but the fonts and RSVP will misbehave — use the server.
