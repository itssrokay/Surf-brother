// Encoded frames stay cheap in memory; only the visible neighbourhood is decoded.
export function unpackFrames(buffer, pack) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 8 || new TextDecoder().decode(bytes.subarray(0, 4)) !== 'SBJ1')
    throw new Error('Invalid journey pack');
  const headerLength = new DataView(buffer).getUint32(4, true);
  const start = 8 + headerLength;
  if (headerLength > 16384 || start >= bytes.length) throw new Error('Invalid journey index');
  const entries = JSON.parse(new TextDecoder().decode(bytes.subarray(8, start)));
  if (!Array.isArray(entries) || entries.length !== pack.last - pack.first + 1)
    throw new Error('Incomplete journey pack');
  const frames = new Map();
  for (const entry of entries) {
    const { frame, offset, length } = entry;
    if (![frame, offset, length].every(Number.isInteger) || frame < pack.first ||
        frame > pack.last || offset < 0 || length < 1 || start + offset + length > bytes.length || frames.has(frame))
      throw new Error('Invalid journey frame');
    frames.set(frame, new Blob([bytes.subarray(start + offset, start + offset + length)], { type: 'image/webp' }));
  }
  return frames;
}

export class FramePacks {
  constructor(packs, { root = '/media/journey/', fetcher = (...args) => globalThis.fetch(...args), onChange = () => {} } = {}) {
    this.packs = packs;
    this.root = root;
    this.fetcher = fetcher;
    this.onChange = onChange;
    this.frames = new Map();
    this.ready = new Set();
    this.failed = new Set();
    this.pending = new Map();
    this.queue = new Set();
    this.desired = 1;
    this.active = false;
    this.bytes = 0;
    this.requests = 0;
  }
  setActive(active) { this.active = active; if (active) this.pump(); }
  request(frame, warmAll = false) {
    this.desired = frame;
    const index = this.packs.findIndex(p => frame >= p.first && frame <= p.last);
    if (index < 0) return;
    for (const i of warmAll ? this.packs.map((_, i) => i) : [index, index + 1, index - 1]) {
      if (this.packs[i] && !this.ready.has(i) && !this.failed.has(i) && !this.pending.has(i)) this.queue.add(i);
    }
    this.pump();
  }
  pump() {
    if (!this.active) return;
    const distance = (i) => {
      const p = this.packs[i];
      return this.desired < p.first ? p.first - this.desired : this.desired > p.last ? this.desired - p.last : 0;
    };
    for (const i of [...this.queue].sort((a, b) => distance(a) - distance(b))) {
      if (this.pending.size >= 2) break;
      if (this.ready.has(i) || this.failed.has(i)) { this.queue.delete(i); continue; }
      if (this.pending.has(i)) continue;
      this.queue.delete(i);
      const abort = new AbortController();
      this.pending.set(i, abort);
      this.requests++;
      let response;
      try { response = this.fetcher(this.root + this.packs[i].url, { signal: abort.signal, cache: 'force-cache' }); }
      catch (error) { response = Promise.reject(error); }
      Promise.resolve(response)
        .then(r => { if (!r.ok) throw new Error('Journey pack unavailable'); return r.arrayBuffer(); })
        .then(buffer => {
          if (abort.signal.aborted) return;
          const frames = unpackFrames(buffer, this.packs[i]);
          frames.forEach((blob, frame) => this.frames.set(frame, blob));
          this.bytes += buffer.byteLength;
          this.ready.add(i);
        })
        .catch(() => { if (!abort.signal.aborted) this.failed.add(i); })
        .finally(() => {
          // An old aborted request must not clear a newly resumed request.
          if (this.pending.get(i) !== abort) return;
          this.pending.delete(i);
          this.onChange();
          this.pump();
        });
    }
  }
  reset() {
    this.active = false;
    this.pending.forEach(abort => abort.abort());
    this.pending.clear();
    this.queue.clear();
    this.ready.clear();
    this.failed.clear();
    this.frames.clear();
    this.bytes = 0;
  }
}
