# For Nija

A birthday page, gated behind her birthday. The gradient is the subject
rather than a wash behind it: the gate holds it at a third strength, so the
page reads pastel while she's typing, and getting the date right takes it to
full colour. That transition is the reward.

Five pages sit behind the gate — a hub of three heart-shaped gift boxes, and
one surprise behind each: a letter, photos, and a cake she cuts herself,
then a night sky to send a wish up into.

React + Vite, plain CSS. No animation library, no UI kit, no fonts bundled —
just two faces loaded from Google Fonts.

## Run it

```
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview  # serve the built site locally
```

## The password

`12 / 10` — her birthday, day then month. Typing `1210`, `12/10` or `12-10`
all work; only the digits are checked.

Set it in `src/content.js`:

```js
export const BIRTHDAY = { day: 12, month: 10 };
```

Get it wrong and the **Open** button starts dodging the cursor. It settles
down the moment the field is edited, Enter always submits, and it doesn't
dodge at all for anyone browsing with reduced motion — the joke can't lock
anybody out.

Once she's in, it's remembered in `localStorage`, so a reload doesn't ask
again. **Lock it again** in the footer clears that, which is also the
quickest way to re-test the gate.

## The pages

| Route      | What it is                                        |
| ---------- | ------------------------------------------------- |
| `#/boxes`  | The hub. Three heart boxes, each opening one page. |
| `#/letter` | The envelope. Click it and the flap turns on a hinge. |
| `#/gallery`| Photos alternating side to side with their stories. |
| `#/cake`   | The cake. Drag the knife across it, or press the button. |
| `#/wishes` | Type a wish, send it up into the night sky.       |

The gate isn't a route — it's a guard in front of all of them, so it never
appears in the URL. Any unrecognised hash falls back to `#/boxes`.

## Changing the content

Everything editable lives in **`src/content.js`** — the quote on the envelope,
the letter, every photo caption, the music filename, the nudges the gate
throws at you. No component code needs touching.

### Photos

1. Drop the files into `public/photos/`.
2. Point at them in `content.js`:

```js
export const memories = [
  {
    src: '/photos/beach.jpg',
    alt: 'Nija laughing on the beach at sunset',
    title: 'The same laugh, all these years',
    story: '…',
  },
];
```

Leave `src` as `null` and that memory shows an empty frame instead, so the
page never looks broken while you're still collecting pictures. Add or remove
entries freely — they keep alternating sides on their own, and photos are
cropped to 4:5 on desktop, 5:4 on phones.

`alt` is what a blind visitor hears. Describe the photo, don't label it.

### The song

A song is already in place — `public/music/song1.mpeg` — and `music.src` in
`content.js` points at it. To swap it, drop your file into `public/music/` and
update that path.

Note it's `/music/song1.mpeg`, never `/public/music/song1.mpeg`. Everything in
`public/` is served from the root, so `/photos/` works the same way. A wrong
path doesn't crash anything — the player just reports the song as missing.

Browsers won't autoplay audio, which is why it's a button she presses.

## How it's put together

```
src/
  content.js            everything you'd want to edit
  App.jsx               the gate, the routes, and the particle layers
  components/
    Aurora.jsx          the animated gradient, the star field, light curtains
    Motes.jsx           specks of light rising
    Confetti.jsx        the falling bursts
    Gate.jsx            the password, and the button that runs away
    Boxes.jsx           the hub — three heart-shaped gift boxes
    Letter.jsx          the envelope with a hinged flap
    Gallery.jsx         alternating photo + story
    Cake.jsx            the cake you cut, and the celebration it sets off
    Wishes.jsx          write a wish, send it up
    MusicButton.jsx     fixed play / pause and volume
    PageNav.jsx         back / next between the surprises
  lib/
    motion.js           reduced motion, scroll reveal, the particle factories
    router.js           a hash router in about thirty lines
  styles/               one stylesheet per component, plus base and page
tools/shoot.mjs         screenshot harness (see below)
```

Three conventions worth knowing before editing the CSS:

- **The vertical rhythm lives in `page.css` only.** Each page's stylesheet
  owns what happens *inside* it, never the space between sections, so no two
  files fight over the spacing.
- **The palette is in `base.css`** as custom properties — the five party
  colours, plus the plum ink and the light surfaces. Two rules come out of
  it: the five full-strength colours are for decoration and never for text,
  because none of them holds 4.5:1 against the others; and any small text
  sitting on the gradient needs its own ground.
- **Text on the gradient gets a glow, not a panel.** A blurred white radial
  behind a heading lifts the ground from about 3.9:1 to better than 7:1
  without drawing a box around the words. That's why there are so many
  `::before` rules — they're the same trick repeated wherever type lands on
  a moving background.

## Motion

One orchestrated sequence, on unlock: the gate falls away, confetti throws,
the gradient floods to full strength, specks rise, and the hub's three hearts
arrive one after another. After that nothing moves on its own except the
slow drift of the gradient and the letter's seal. Everything else answers a
tap — the bow coming off a box, the flap turning, the knife travelling, the
candles going out.

`prefers-reduced-motion: reduce` is honoured throughout. The ignition becomes
a cross-fade, confetti and motes aren't rendered, the wish doesn't fly, the
knife isn't drawn at all (the button does the same job), and the gate's
button shakes its head instead of running away.

## Accessibility

- Every route change moves focus to the new page's heading, so keyboard and
  screen-reader users arrive where everyone else is looking.
- The gate's four dots are a real `<input>` lying invisible on top of them,
  so typing, pasting, the mobile keyboard and screen readers all keep working
  while the value shows as circles.
- The cake is cuttable by button, not only by dragging a knife.
- Status text uses `role="status"` so the wrong-password nudge and the wish
  counter are announced rather than only seen.
- One focus treatment for the whole site, in plum — the only ink that clears
  3:1 against all five gradient stops, so the ring stays visible wherever the
  gradient happens to be.

## Screenshots

`tools/shoot.mjs` drives headless Chrome over the DevTools protocol and walks
every page and both viewports, including the states behind the gate.
`tools/verify.sh` does the whole dance — build, serve `dist/`, start a headless
Chrome with a debugging port, shoot:

```
bash tools/verify.sh        # → .shots/
```

It assumes Chrome is at the usual Windows install path and that nothing is
already listening on 5175 or 9222. To do it by hand instead:

```
chrome --headless=new --remote-debugging-port=9222 about:blank
npm run dev -- --port 5175
node --experimental-websocket tools/shoot.mjs
```

Node 20 needs the `--experimental-websocket` flag; on 22 and up the global
`WebSocket` is there already and the flag can go.

## Deploying

It's a static site. `npm run build` and serve `dist/` anywhere — Netlify,
Vercel, GitHub Pages, S3, or an `express.static('dist')` route if you want it
inside an existing Node app. `base` is set to `./` in `vite.config.js`, so it
works from a subfolder too.

No backend is needed, and that's worth being clear about: the password is
checked in the browser, so anyone who reads the page source can find it. It's
a nice front door for a surprise, not a lock. Don't put anything on here that
would matter if a stranger saw it.
