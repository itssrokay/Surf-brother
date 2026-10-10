import { readFile, mkdir, writeFile, stat, rm } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { validateContent } from './src/content-validation.js';
import { galleryPhoto } from './src/media-paths.js';
import { escapeHTML } from './src/content-copy.js';

const virtualId = 'virtual:cms-images';
const resolvedId = '\0' + virtualId;

const websitePhotos = content => [...content.gallery, ...Object.values(content.homepage || {})];

// Render the hero before the browser requests it, including its matching preload.
export function renderHomepageHTML(html, content, manifest) {
  const hero = content.homepage.hero;
  const values = {
    IMAGE: galleryPhoto(hero, manifest),
    ALT: hero.alt,
    CAPTION: hero.caption,
    SECONDARY_CAPTION: hero.secondaryCaption || '',
  };
  return html.replace(/__CMS_HERO_(IMAGE|ALT|CAPTION|SECONDARY_CAPTION)__/g,
    (_, key) => escapeHTML(values[key]));
}

export async function preparePhotos(root, content) {
  const manifest = {};
  const generatedDir = path.join(root, 'public/media/cms-generated');
  await rm(generatedDir, { recursive: true, force: true });
  const paths = [...new Set(websitePhotos(content).map(photo => photo.file)
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
    const metadata = await sharp(input, { limitInputPixels: 40000000 }).metadata();
    const hash = createHash('sha256').update(input).update('webp-v1-1440-640-78').digest('hex').slice(0, 16);
    const name = path.basename(relative, path.extname(relative)).replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 64);
    await mkdir(generatedDir, { recursive: true });
    const result = {};
    for (const [variant, width] of [['full', 1440], ['thumb', 640]]) {
      const filename = `${name}-${hash}-${width}.webp`;
      // Existing optimized owner WebPs keep their exact bytes at full size.
      const alreadyOptimized = variant === 'full' && metadata.format === 'webp'
        && metadata.width <= width && metadata.height <= width
        && !metadata.exif && !metadata.xmp && !metadata.icc && !metadata.orientation
        && (!metadata.pages || metadata.pages === 1);
      const output = alreadyOptimized ? input : await sharp(input, { limitInputPixels: 40000000 })
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
  let root, content, ready, manifest = {};
  const prepare = async () => {
    content = JSON.parse(await readFile(path.join(root, 'src/content.json'), 'utf8'));
    validateContent(content);
    manifest = await preparePhotos(root, content);
    // Missing legacy photos should fail the build rather than publish broken images.
    for (const photo of websitePhotos(content)) {
      if (photo.file.startsWith('/media/uploads/')) continue;
      for (const file of [photo.file, photo.thumb || photo.file])
        await stat(path.join(root, 'public/media', file.replace(/^\/media\//, '')));
    }
  };
  return {
    name: 'surfbrothers-cms',
    configResolved(config) { root = config.root; },
    async buildStart() { ready = prepare(); await ready; },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        ready ||= prepare();
        await ready;
        return renderHomepageHTML(html, content, manifest);
      },
    },
    resolveId(id) { if (id === virtualId) return resolvedId; },
    load(id) { if (id === resolvedId) return `export default ${JSON.stringify(manifest)};`; },
    configureServer(server) { server.watcher.add(path.join(root, 'uploads/photos')); },
    async handleHotUpdate(ctx) {
      if (ctx.file === path.join(root, 'src/content.json') || ctx.file.startsWith(path.join(root, 'uploads/photos') + path.sep)) {
        ready = prepare();
        await ready;
        const module = ctx.server.moduleGraph.getModuleById(resolvedId);
        if (module) ctx.server.moduleGraph.invalidateModule(module);
        ctx.server.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}
