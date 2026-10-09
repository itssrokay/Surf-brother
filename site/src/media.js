import manifest from 'virtual:cms-images';
import { galleryPhoto } from './media-paths.js';
export const galleryImage = (photo, thumbnail = false) => galleryPhoto(photo, manifest, thumbnail);
