import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import YAML from 'yaml';
import sharp from 'sharp';
import { resolveContentCopy, escapeHTML } from './content-copy.js';
import { validateContent } from './content-validation.js';
import { galleryPhoto, mediaPath } from './media-paths.js';
import { preparePhotos } from '../cms-plugin.js';
import { composeEnquiry } from './packages.js';

const source = JSON.parse(await readFile(new URL('./content.json', import.meta.url)));

test('CMS keeps unrelated content and protects package identity fields', async () => {
  const config = YAML.parse(await readFile(new URL('../../.pages.yml', import.meta.url), 'utf8'));
  assert.equal(config.settings.content.merge, true);
  assert.equal(new Set(config.content.map(x => x.name)).size, config.content.length);
  for (const entry of config.content) {
    assert.equal(entry.path, 'site/src/content.json');
    for (const field of entry.fields) assert.ok(field.name in source, field.name);
  }
  const prices = config.content.find(x => x.name === 'prices').fields[0];
  for (const mode of ['surfOnly', 'staySurf']) {
    const courses = prices.fields.find(x => x.name === mode).fields.find(x => x.name === 'courses');
    assert.equal(courses.list.min, courses.list.max);
    assert.equal(courses.fields.find(x => x.name === 'days').readonly, true);
  }
  validateContent(source);
});

test('edited rates and terms reach FAQs and enquiries without stale copied prices', () => {
  const edited = structuredClone(source);
  edited.packages.meals.find(x => x.id === 'veg').rate = 350;
  edited.packages.surfOnly.courses.find(x => x.days === 1).rate = 2200;
  edited.packages.staySurf.courses.find(x => x.days === 3).rates.nonAc = 9500;
  edited.packages.staySurf.payment = '₹2,500 advance per person; balance at check-in.';
  edited.packages.offer.amount = 1200;
  const copy = resolveContentCopy(edited);
  assert.match(copy.faqs.find(x => x.question === 'Are meals included?').answer, /₹350\/day/);
  assert.match(copy.faqs.find(x => x.question === 'How do payments and refunds work?').answer, /₹2,500 advance/);
  assert.match(copy.learning.longer, /₹2,200/);
  assert.match(copy.packages.offer.label, /₹1,200 off/);
  const message = composeEnquiry(copy, { mode: 'staySurf', days: 3, stay: 'nonAc', guests: 2, date: '2099-02-02', meals: 'veg' });
  assert.match(message, /Listed rate: ₹9,500/);
  assert.match(message, /Veg, ₹350\/day/);
  assert.doesNotMatch(message, /Total:|₹19,000/);
  assert.equal(source.packages.meals.find(x => x.id === 'veg').rate, 300);
});

test('invalid CMS edits stop a build before broken prices or gallery IDs publish', () => {
  for (const mutate of [
    c => { c.packages.staySurf.courses[0].rates.ac = -1; },
    c => { c.packages.surfOnly.courses[0].days = 2; },
    c => { c.gallery[1].id = c.gallery[0].id; },
    c => { c.contacts.phones[0].whatsapp = '123'; },
    c => { c.gallery[0].file = '../originals/private.jpg'; },
  ]) {
    const edited = structuredClone(source);
    mutate(edited);
    assert.throws(() => validateContent(edited));
  }
});

test('new photos use generated thumbnails while existing filenames still work', () => {
  const photo = { file: '/media/uploads/new.jpg', thumb: 'old-small.webp' };
  const manifest = { '/media/uploads/new.jpg': { full: '/media/cms-generated/new-1440.webp', thumb: '/media/cms-generated/new-640.webp' } };
  assert.equal(galleryPhoto(photo, manifest, true), '/media/cms-generated/new-640.webp');
  assert.equal(galleryPhoto({ file: 'hero.webp', thumb: 'hero-small.webp' }, {}, false), '/media/hero.webp');
  assert.equal(mediaPath('/media/stay-6.webp'), '/media/stay-6.webp');
  assert.throws(() => galleryPhoto(photo, {}));
  assert.equal(escapeHTML('Garden "A" < view'), 'Garden &quot;A&quot; &lt; view');
});

test('photo uploads produce bounded WebP sizes, strip metadata and change URLs on replacement', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'surf-cms-photo-'));
  try {
    await mkdir(path.join(root, 'uploads/photos'), { recursive: true });
    const original = await sharp({ create: { width: 2400, height: 1800, channels: 3, background: '#0c8585' } })
      .withMetadata().jpeg({ quality: 95 }).toBuffer();
    await writeFile(path.join(root, 'uploads/photos/test.jpg'), original);
    const content = { gallery: [{ file: '/media/uploads/test.jpg' }] };
    const first = await preparePhotos(root, content);
    for (const [kind, expectedWidth] of [['full', 1440], ['thumb', 640]]) {
      const file = path.join(root, 'public', first['/media/uploads/test.jpg'][kind]);
      const meta = await sharp(file).metadata();
      assert.equal(meta.format, 'webp');
      assert.equal(meta.width, expectedWidth);
      assert.equal(meta.exif, undefined);
      assert.ok((await readFile(file)).length < original.length);
    }
    const changed = await sharp({ create: { width: 2400, height: 1800, channels: 3, background: '#f6ba72' } }).jpeg().toBuffer();
    await writeFile(path.join(root, 'uploads/photos/test.jpg'), changed);
    const second = await preparePhotos(root, content);
    assert.notEqual(first['/media/uploads/test.jpg'].full, second['/media/uploads/test.jpg'].full);
    await assert.rejects(() => preparePhotos(root, { gallery: [{ file: '/media/uploads/../escape.jpg' }] }));
  } finally { await rm(root, { recursive: true, force: true }); }
});
