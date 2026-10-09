export function mediaPath(file) {
  if (typeof file !== 'string' || !file.trim()) return '';
  const path = file.startsWith('/media/') ? file : `/media/${file}`;
  if (!/^\/media\/[a-zA-Z0-9_./() -]+$/.test(path) || path.split('/').includes('..'))
    throw new Error(`Invalid local media path: ${file}`);
  return path;
}

export function galleryPhoto(photo, manifest, thumbnail = false) {
  const path = mediaPath(photo.file);
  const generated = manifest[path];
  if (path.startsWith('/media/uploads/')) {
    if (!generated) throw new Error(`Uploaded photo was not prepared: ${path}`);
    return generated[thumbnail ? 'thumb' : 'full'];
  }
  return thumbnail ? mediaPath(photo.thumb || photo.file) : path;
}
