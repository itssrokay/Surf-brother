// The individual frame exports are editable/local sources. Production uses packs.
import { rm, access } from 'node:fs/promises';
const dist = new URL('../site/dist/', import.meta.url);
await access(new URL('index.html', dist));
for (const variant of ['large', 'small'])
  await rm(new URL(`media/journey/${variant}/`, dist), { recursive: true, force: true });
console.log('Production media uses the 16 responsive delivery packs. Original exports retained in public/media/journey.');
