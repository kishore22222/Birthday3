/**
 * The site's one synthesised sound. A blade going through cake is filtered
 * noise with a fast decay, so it can be built on the spot — no audio file to
 * load, nothing to 404, and nothing added to the bundle.
 *
 * Browsers only let audio start from a user gesture. Every path here is a
 * click or a drag release, so the context is always created inside one and
 * never begins life suspended.
 */

let context = null;

function audioContext() {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext || window.webkitAudioContext;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  // Safari parks the context between gestures; resuming inside the gesture
  // that needs it is a no-op in every other browser.
  if (context.state === 'suspended') context.resume();
  return context;
}

/**
 * A short "shhk". The band sweeps downward, which is what stops it reading
 * as a flat hiss — the pitch falling is the blade losing speed.
 *
 * Deliberately quiet (peaks around 0.2) and 160ms long, because it lands on
 * top of whatever the music player is doing and is meant to be felt more
 * than heard.
 */
export function playSlice() {
  const ctx = audioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const seconds = 0.16;
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    // The decay is in the source as well as in the gain envelope, so the
    // tail can't click when the node stops.
    data[i] = (Math.random() * 2 - 1) * (1 - i / length);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.Q.value = 1.1;
  band.frequency.setValueAtTime(2600, now);
  band.frequency.exponentialRampToValueAtTime(700, now + 0.14);

  const gain = ctx.createGain();
  // Exponential ramps can't touch zero, hence the tiny floor at each end.
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.2, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + seconds);

  source.connect(band).connect(gain).connect(ctx.destination);
  source.start(now);
  source.stop(now + seconds);
}
