import manifest from 'virtual:cms-images';
import { galleryPhoto } from './media-paths.js';
export const contentImage = (photo, thumbnail = false) => galleryPhoto(photo, manifest, thumbnail);
export const galleryImage = contentImage;
