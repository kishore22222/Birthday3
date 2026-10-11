The song goes in this folder.

One is already here — song1.mpeg — and `src/content.js` points at it, so the
player works as-is. To swap it, drop your file in this folder and change the
path under `music` in `src/content.js`:

  src: '/music/your-song.mp3',

The path starts with /music/ — that's this folder. It is NOT /public/music/,
which is a 404: everything in public/ is served from the root.

If your file is an MP3, name it .mp3. A few browsers refuse to play an MP3
that is named .mpeg, because the name is what tells them the type.
