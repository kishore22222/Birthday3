// Throwaway screenshot harness. Drives headless Chrome over CDP so the real
// page can be reviewed, including every state behind the password gate.
//
//   chrome --headless=new --remote-debugging-port=9222 about:blank
//   npm run dev -- --port 5175
//   node --experimental-websocket tools/shoot.mjs
import { mkdirSync, writeFileSync } from 'node:fs';

const ORIGIN = process.env.SHOOT_ORIGIN || 'http://localhost:5175/';
const OUT = '.shots';
mkdirSync(OUT, { recursive: true });

const version = await (await fetch('http://127.0.0.1:9222/json/version')).json();
const socket = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.onopen = resolve;
  socket.onerror = reject;
});

let nextId = 0;
const pending = new Map();
const waiters = [];

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    message.error ? reject(new Error(JSON.stringify(message.error))) : resolve(message.result);
    return;
  }
  for (let i = waiters.length - 1; i >= 0; i -= 1) {
    if (waiters[i].method === message.method) {
      waiters[i].resolve(message.params);
      waiters.splice(i, 1);
    }
  }
};

let sessionId;
function send(method, params = {}, useSession = true) {
  const id = ++nextId;
  const payload = { id, method, params };
  if (useSession && sessionId) payload.sessionId = sessionId;
  socket.send(JSON.stringify(payload));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

const once = (method) => new Promise((resolve) => waiters.push({ method, resolve }));
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const { targetId } = await send('Target.createTarget', { url: 'about:blank' }, false);
({ sessionId } = await send('Target.attachToTarget', { targetId, flatten: true }, false));
await send('Page.enable');
await send('Runtime.enable');

async function viewport(width, height, mobile = false) {
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 2,
    mobile,
  });
}

async function go(url) {
  const loaded = once('Page.loadEventFired');
  await send('Page.navigate', { url });
  await loaded;
  await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
  await wait(400);
}

async function run(expression) {
  const { result, exceptionDetails } = await send('Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (exceptionDetails) throw new Error(JSON.stringify(exceptionDetails));
  return result.value;
}

async function shoot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(data, 'base64'));
  console.log('shot', name);
}

/** Types into a controlled React input the way a person would. */
const type = (selector, value) => run(`(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  if (!el) throw new Error('no element for ' + ${JSON.stringify(selector)});
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(el, ${JSON.stringify(value)});
  el.dispatchEvent(new Event('input', { bubbles: true }));
  return el.value;
})()`);

const click = (selector) => run(`(() => {
  const el = document.querySelector(${JSON.stringify(selector)});
  if (!el) throw new Error('no element for ' + ${JSON.stringify(selector)});
  el.click();
  return true;
})()`);

const submit = (selector) => run(`(() => {
  document.querySelector(${JSON.stringify(selector)}).requestSubmit();
  return true;
})()`);

/** Routes are hash-driven, so a page is one assignment. */
const open = async (route) => {
  await run(`location.hash = '#/${route}', true`);
  await wait(900);
};

const clearGate = () => run(`localStorage.clear(), true`);

/** Unlocks once, then leaves the session open for the rest of the run. */
async function unlock() {
  await type('.gate-input', '1210');
  await submit('.gate-form');
  await wait(3000);
}

// ─── Desktop ──────────────────────────────────────────────────────────────
await viewport(1440, 900);
await go(ORIGIN);
await clearGate();
await go(ORIGIN);
await wait(1600); // let the entrance sequence finish
await shoot('01-gate-desktop');

// Wrong password, so the button has run off somewhere.
await type('.gate-input', '0101');
await submit('.gate-form');
await wait(900);
await shoot('02-gate-wrong');

// Right password, caught mid-ignition and then settled on the hub.
await type('.gate-input', '1210');
await submit('.gate-form');
await wait(650);
await shoot('03-ignition');
await wait(2600);
await shoot('04-boxes-desktop');

// A heart with the cursor on it, so the glow state is on the record.
await click('.heartbox--purple');
await wait(500);
await shoot('05-boxes-opening');
await wait(900);

await open('letter');
await shoot('06-letter-closed');
await click('.letter-envelope');
await wait(1600);
await shoot('07-letter-open');

await open('gallery');
await wait(1200);
await shoot('08-gallery-desktop');

await open('cake');
await wait(700);
await shoot('09-cake-whole');
await click('.cake-cut');
await wait(1500);
await shoot('10-cake-cut');

await open('wishes');
await type('.wishes-input', 'A year that’s kind to you');
await wait(200);
await shoot('11-wishes-typed');
await submit('.wishes-form');
await wait(1400);
await shoot('12-wishes-sent');

// ─── Phone, 380px ─────────────────────────────────────────────────────────
await viewport(380, 844, true);
await go(ORIGIN);
await clearGate();
await go(ORIGIN);
await wait(1600);
await shoot('13-gate-mobile');

await unlock();
await shoot('14-boxes-mobile');

await open('letter');
await click('.letter-envelope');
await wait(1600);
await shoot('15-letter-mobile');

await open('gallery');
await wait(1200);
await shoot('16-gallery-mobile');

await open('cake');
await wait(700);
await click('.cake-cut');
await wait(1500);
await shoot('17-cake-mobile');

await open('wishes');
await type('.wishes-input', 'More rest than you ask for');
await submit('.wishes-form');
await wait(1400);
await shoot('18-wishes-mobile');

socket.close();
console.log('done');
process.exit(0);
