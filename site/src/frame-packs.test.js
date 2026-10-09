import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { FramePacks, unpackFrames } from './frame-packs.js';
const media = new URL('../public/media/journey/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('sequence.json', media), 'utf8'));
const bytesFor = async (pack) => {
  const buffer = await readFile(new URL(pack.url, media));
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
};

test('all delivery packs preserve every original WebP, including the last frame', async () => {
  for (const variant of ['small', 'large']) {
    const seen = new Set();
    for (const pack of manifest.packs[variant]) {
      const frames = unpackFrames(await bytesFor(pack), pack);
      for (const [frame, blob] of frames) {
        assert.ok(!seen.has(frame));
        seen.add(frame);
        assert.deepEqual(Buffer.from(await blob.arrayBuffer()),
          await readFile(new URL(`${variant}/${String(frame).padStart(3, '0')}.webp`, media)));
      }
    }
    assert.equal(seen.size, 96);
    assert.ok(seen.has(1) && seen.has(96));
  }
});

test('fast scroll jumps take next network slot; reverse scroll makes no new requests', async () => {
  const calls = [], waiting = [];
  const packs = manifest.packs.small;
  const store = new FramePacks(packs, { fetcher: (url) => new Promise(resolve => {
    calls.push(url);
    waiting.push(async () => resolve({ ok: true, arrayBuffer: () => bytesFor(packs.find(p => url.endsWith(p.url))) }));
  }) });
  const flush = async () => { await new Promise(resolve => setTimeout(resolve, 5)); };
  store.setActive(true);
  store.request(1, true);
  assert.equal(calls.length, 2);
  store.request(90, true);
  await waiting.shift()(); await flush();
  assert.ok(calls[2].endsWith(packs[7].url), 'jump to Ride should be next, before stale intermediate frames');
  while (waiting.length) { await waiting.shift()(); await flush(); }
  assert.equal(calls.length, 8);
  assert.equal(store.frames.size, 96);
  for (const frame of [1, 90, 45, 96, 2]) store.request(frame, true);
  assert.equal(calls.length, 8, 'encoded frames survive decoded-frame eviction and reverse scrolling');
  assert.equal(store.pending.size, 0);
  assert.equal(store.failed.size, 0);
});

test('failed network packs terminate without request loops; pausing stops queued delivery', async () => {
  let calls = 0;
  const store = new FramePacks(manifest.packs.small, { fetcher: async () => { calls++; return { ok: false }; } });
  store.request(1, true);
  assert.equal(calls, 0);
  store.setActive(true);
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(calls, 8);
  store.request(1, true);
  assert.equal(calls, 8);
  assert.equal(store.failed.size, 8);
  assert.equal(store.pending.size, 0);
  store.reset();
  assert.equal(store.frames.size, 0);
});

test('truncated and corrupt packs are rejected instead of drawing invalid frames', async () => {
  const pack = manifest.packs.small[0], buffer = await bytesFor(pack);
  assert.throws(() => unpackFrames(buffer.slice(0, 100), pack));
  const corrupt = buffer.slice(0);
  new Uint8Array(corrupt)[0] = 0;
  assert.throws(() => unpackFrames(corrupt, pack));
});

test('native browser fetch keeps its Window receiver instead of using the frame store', async () => {
  const originalFetch = globalThis.fetch;
  const pack = manifest.packs.small[0];
  globalThis.fetch = function () {
    if (this !== globalThis) throw new TypeError('Illegal invocation: fetch receiver must be Window');
    return Promise.resolve({ ok: true, arrayBuffer: () => bytesFor(pack) });
  };
  try {
    const store = new FramePacks([pack]);
    store.setActive(true);
    assert.doesNotThrow(() => store.request(1));
    await new Promise(resolve => setTimeout(resolve, 15));
    assert.equal(store.frames.size, 12);
    assert.equal(store.failed.size, 0);
  } finally { globalThis.fetch = originalFetch; }
});

test('a synchronous browser network exception is handled without stranding pending packs', async () => {
  const store = new FramePacks(manifest.packs.small, { fetcher: () => { throw new TypeError('Network unavailable'); } });
  store.setActive(true);
  assert.doesNotThrow(() => store.request(1));
  await new Promise(resolve => setTimeout(resolve, 10));
  assert.equal(store.pending.size, 0);
  assert.equal(store.failed.size, 2);
});
