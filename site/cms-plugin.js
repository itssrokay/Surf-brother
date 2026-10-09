import { readFile, mkdir, writeFile, stat, rm } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { validateContent } from './src/content-validation.js';

const virtualId = 'virtual:cms-images';
const resolvedId = '\0' + virtualId;

export async function preparePhotos(root, content) {
  const manifest = {};
  const generatedDir = path.join(root, 'public/media/cms-generated');
  await rm(generatedDir, { recursive: true, force: true });
  const paths = [...new Set(content.gallery.map(photo => photo.file)
    .filter(file => file.startsWith('/media/uploads/')))];
  for (const publicPath of paths) {
    const relative = publicPath.slice('/media/uploads/'.length);
    const source = path.resolve(root, 'uploads/photos', relative);
    const uploads = path.resolve(root, 'uploads/photos') + path.sep;
    if (!source.startsWith(uploads) || !/\.(jpe?g|png|webp)$/i.test(relative))
      throw new Error(`Unsupported photo upload: ${publicPath}`);
    if ((await stat(source)).size > 15 * 1024 * 1024)
      throw new Error(`Photo exceeds 15 MB: ${relative}. Resize it before uploading.`);
    const input = await readFile(source);
    const hash = createHash('sha256').update(input).update('webp-v1-1440-640-78').digest('hex').slice(0, 16);
    const name = path.basename(relative, path.extname(relative)).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64);
    await mkdir(generatedDir, { recursive: true });
    const result = {};
    for (const [variant, width] of [['full', 1440], ['thumb', 640]]) {
      const filename = `${name}-${hash}-${width}.webp`;
      const output = await sharp(input, { limitInputPixels: 40000000 })
        .rotate().resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 78 }).toBuffer();
      await writeFile(path.join(generatedDir, filename), output);
      result[variant] = `/media/cms-generated/${filename}`;
    }
    manifest[publicPath] = result;
  }
  return manifest;
}

export function cmsPlugin() {
  let root, manifest = {};
  const prepare = async () => {
    const content = JSON.parse(await readFile(path.join(root, 'src/content.json'), 'utf8'));
    validateContent(content);
    manifest = await preparePhotos(root, content);
    // Missing legacy photos should fail the build rather than publish broken images.
    for (const photo of content.gallery) {
      if (photo.file.startsWith('/media/uploads/')) continue;
      for (const file of [photo.file, photo.thumb || photo.file])
        await stat(path.join(root, 'public/media', file.replace(/^\/media\//, '')));
    }
  };
  return {
    name: 'surfbrothers-cms',
    configResolved(config) { root = config.root; },
    async buildStart() { await prepare(); },
    resolveId(id) { if (id === virtualId) return resolvedId; },
    load(id) { if (id === resolvedId) return `export default ${JSON.stringify(manifest)};`; },
    configureServer(server) { server.watcher.add(path.join(root, 'uploads/photos')); },
    async handleHotUpdate(ctx) {
      if (ctx.file === path.join(root, 'src/content.json') || ctx.file.startsWith(path.join(root, 'uploads/photos') + path.sep)) {
        await prepare();
        const module = ctx.server.moduleGraph.getModuleById(resolvedId);
        if (module) ctx.server.moduleGraph.invalidateModule(module);
        ctx.server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}
