/**
 * Everything you'd want to change lives in this file.
 * Edit the text, drop photos into `public/photos/`, drop a song into
 * `public/music/` — no component code needs touching.
 */

/** Her birthday, day then month. This is the password for the gate. */
export const BIRTHDAY = { day: 12, month: 10 };

/** PAGE 1 — shown before anything else opens. */
export const gate = {
  forWhom: 'For Nija',
  heading: 'The sky’s been waiting for the twelfth.',
  invitation:
    'It only opens for you, akka. Your birthday — the day first, then the month.',
  inputLabel: 'Your birthday, four digits: day then month',
  action: 'Open',
  // Shown once the button starts dodging, so there's always a way through.
  enterHint: 'Press Enter — the button is no help to you right now.',
  clearAction: 'Clear',
  // Shown one after another as the guesses go wrong. The last one repeats.
  nudges: [
    'Not that one. Try your birthday, day first.',
    'Still no — and now the button’s getting nervous.',
    'Day, then month. The button is actively avoiding you at this point.',
    'Here’s the hint: it’s the day the sky clears for you.',
  ],
};

/** PAGE 2 — the hub. Each box leads to one of the three surprises. */
export const boxes = {
  greeting: 'Happy birthday, akka.',
  heading: 'Tap on the mystery box to unlock your gift!',
  openedNote: 'Opened — you can always go back in.',
  items: [
    {
      id: 'letter',
      title: 'A letter',
      hint: 'The part I couldn’t fit on a card',
      // Drives the heart's fill. Each box gets its own colour.
      hue: 'magenta',
    },
    {
      id: 'gallery',
      title: 'Your photos',
      hint: 'A few I kept',
      hue: 'pink',
    },
    {
      id: 'cake',
      title: 'The cake',
      hint: 'Yours to cut',
      hue: 'purple',
    },
  ],
};

export const letter = {
  heading: 'A letter for you',
  teaser: 'A letter, for when you have a minute',
  openAction: 'Open the letter',
  closeAction: 'Close the letter',
  greeting: 'Akka,',
  body: [
    'Happy birthday to you.',
    '',
    'You\'re the kind of person who makes everyone around you feel valued. Your kindness isn\'t just words — it\'s in the little things you do, the way you listen, and how you always show up when it matters.',
    '',
    'I hope this year brings you as much joy as you bring to others. May your days be filled with laughter, your heart with peace, and your life with endless possibilities.',
    '',
    'Thank you for being our constant reminder of what it means to be genuinely good.',
    '',
    'Here\'s to a birthday filled with magic and all the happiness you deserve. You are so deeply loved and appreciated.',
    '',
    'Happy Birthday, Nija Akka! 🎂✨💕',
  ],
  signature: 'Kishore',
};
/**
 * PAGE 3B — the photo gallery. Each memory alternates sides automatically.
 * `src`: put your file in `public/photos/` and reference it as '/photos/name.jpg'.
 *        Leave it as null and a placeholder frame shows instead.
 * `alt`:  describe the photo for anyone using a screen reader.
 * Add or remove entries freely — the layout keeps alternating.
 */
export const gallery = {
  heading: 'Your photos',
  invitation: 'A few I kept, and why.',
};

export const memories = [
  {
    src: '/photos/img1.jpeg',
    alt: 'Nija smiling brightly in a sunlit moment',
    title: 'The same laugh, all these years',
    story:
      'The laugh hasn’t moved an inch. It’s still the sound I listen for when I walk into a room full of people.',
  },
  {
    src: '/photos/img2.jpeg',
    alt: 'Nija looking radiant and joyful',
    title: 'The kind of joy that lights everything up',
    story:
      'Some people carry sunshine with them wherever they go. You’re one of those rare people — the kind whose happiness makes everyone around you feel lighter.',
  },
  {
    src: '/photos/img3.jpeg',
    alt: 'Nija caught in a candid, genuine laugh',
    title: 'Still the first call',
    story:
      'Good news, bad news, nothing-much news. The order hasn’t changed since you were kids and I don’t think it’s going to.',
  },
  {
    src: '/photos/img4.jpeg',
    alt: 'Nija beaming with pure happiness',
    title: 'A laugh that fills the room',
    story:
      'Your laugh has this way of filling every corner of a room with warmth. It’s the kind of sound that makes you want to laugh along, no matter what kind of day you’ve had.',
  },
  {
    src: '/photos/img11.jpeg',
    alt: 'Nija smiling with infectious warmth',
    title: 'Easy joy',
    story:
      'The best kind of joy is the easy kind — the kind you share without trying, just by being yourself. That’s exactly what you bring into every room you walk into.',
  },
 
  {
    src: '/photos/img7.jpeg',
    alt: 'Nija glowing with unfiltered happiness',
    title: 'Unfiltered happiness',
    story:
      'Your smile has always been the most genuine one in the room. It’s real, it’s bright, and it has a way of making people feel safe and loved.',
  },
  {
    src: '/photos/img8.jpeg',
    alt: 'Nija sharing a warm, joyful moment',
    title: 'Side by side',
    story:
      'Through every season, through every high and low — you’ve always been the kind of person worth standing beside.',
  },
  {
    src: '/photos/img9.jpeg',
    alt: 'Nija radiating pure joy',
    title: 'That sparkle',
    story:
      'You’ve always had that sparkle in your eyes. It’s not just the light around you — it’s the light you carry inside of you, and you share it so freely with others.',
  },
  {
    src: '/photos/img10.jpeg',
    alt: 'Nija smiling with genuine warmth',
    title: 'Quiet magic',
    story:
      'You make kindness look effortless. The little things you do, the care you show, the love you give — all of it is quiet magic that changes lives more than you know.',
  },
 
  {
    src: '/photos/img12.jpeg',
    alt: 'Nija looking radiant on her special day',
    title: 'Still shining brighter than ever',
    story:
      'Another year, another reason to celebrate you. If anything, you just keep getting brighter, kinder, and more beautiful with every year that passes.',
  },
];

/** PAGE 3C — the cake. Drag the knife, or press the button. */
export const cake = {
  heading: 'It’s your day',
  invitation: 'Make a wish, then cut it. Drag the knife across, or use the button.',
  cutAction: 'Cut the cake',
  againAction: 'Put it back together',
  knifeLabel: 'Knife — drag it across the cake',
  celebration: 'Happy Birthday, Nija!',
  celebrationNote: 'Every candle out, first try.',
  /** How many candles sit on top. */
  candles: 5,
};

/** PAGE 4 — write a wish and send it up. */
export const wishes = {
  heading: 'Make a wish on the sky',
  invitation:
    'Type it, send it up, and the sky will take it from there. Birthdays are the one night of the year it takes requests.',
  inputLabel: 'Your wish',
  placeholder: 'I wish…',
  action: 'Send it up',
  suggestionsLabel: 'Or borrow one of mine',
  suggestions: [
    'A year that’s kind to you',
    'More rest than you ask for',
    'Everything you’ve been putting off, sorted',
  ],
  // {count} is replaced with the number of wishes sent.
  counter: {
    none: 'Nothing up there yet.',
    one: 'One wish, on its way.',
    many: '{count} wishes, on their way.',
  },
};

/**
 * PAGE 5 — music, fixed at the bottom of every page.
 * Drop your file at `public/music/birthday-song.mp3` and it just works.
 * Rename it here if your file is called something else.
 */
export const music = {
  // Everything in public/ is served from the root, so this is /music/... —
  // NOT /public/music/..., which 404s and makes the player say it's missing.
  src: '/music/audio2.mpeg',
  playAction: 'Play the song',
  pauseAction: 'Pause the song',
  volumeLabel: 'Volume',
  // Shown if the file isn't there yet.
  missing: 'Add your song at public/music/birthday-song.mp3',
};

/** Shared navigation copy. */
export const nav = {
  back: 'Back to the boxes',
  next: 'Next surprise',
  toWishes: 'Make a wish',
  relock: 'Lock it again',
};

export const footer = {
  note: 'Made for Nija, 12 October.',
};
