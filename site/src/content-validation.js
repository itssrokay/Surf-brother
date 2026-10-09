import { mediaPath } from './media-paths.js';

export function validateContent(c) {
  const require = (condition, message) => { if (!condition) throw new Error(`Content: ${message}`); };
  const rate = value => Number.isFinite(value) && value >= 0 && value <= 1000000;
  require(c.brand?.description?.trim() && c.brand?.address?.trim(), 'Business description and address are required.');
  require(Array.isArray(c.contacts?.phones) && c.contacts.phones.length === 2, 'Keep both contact numbers.');
  for (const phone of c.contacts.phones) {
    require(/^\+[1-9]\d{7,14}$/.test(phone.e164), 'Call numbers need + and country code.');
    require(/^[1-9]\d{7,14}$/.test(phone.whatsapp), 'WhatsApp numbers need country code and digits only.');
    require(phone.e164.slice(1) === phone.whatsapp, 'Call and WhatsApp numbers must match.');
  }
  for (const link of [c.contacts.map, c.contacts.instagram]) require(/^https:\/\//.test(link), 'Contact links must start with https://.');
  const p = c.packages;
  const durations = (courses, expected) => courses?.length === expected.length && expected.every(days => courses.filter(x => x.days === days).length === 1);
  require(durations(p?.surfOnly?.courses, [1, 3, 5, 7, 10]), 'Keep the five Surf Only durations.');
  require(durations(p?.staySurf?.courses, [3, 5, 7, 10]), 'Keep the four Stay & Surf durations.');
  for (const course of p.surfOnly.courses) require(course.sessions === course.days && rate(course.rate), 'Surf Only needs one session per day and a valid rate.');
  for (const course of p.staySurf.courses) {
    require(course.nights === course.days - 1, 'Stay package nights must match the course.');
    for (const id of ['camping', 'nonAc', 'ac']) require(rate(course.rates?.[id]), `Missing or invalid ${id} rate.`);
  }
  require(rate(p.surfOnly.private.rate), 'Private training rate is invalid.');
  require(p.meals?.length === 3 && ['none', 'veg', 'nonVeg'].every(id => p.meals.filter(x => x.id === id).length === 1), 'Keep all three meal options.');
  require(p.meals.every(x => rate(x.rate)) && p.meals.find(x => x.id === 'none').rate === 0, 'Meal rates must be valid; no add-on stays ₹0.');
  require(rate(p.offer.amount), 'Offer amount is invalid.');
  require(c.gallery?.length >= 1 && c.gallery.length <= 24, 'Keep between 1 and 24 gallery photos.');
  const ids = new Set();
  for (const photo of c.gallery) {
    require(/^[a-z0-9-]+$/.test(photo.id) && !ids.has(photo.id), 'Photo IDs must be unique lowercase names.');
    ids.add(photo.id);
    require(photo.title?.trim() && photo.alt?.trim(), 'Photos need a caption and description.');
    require(['rooms', 'camping', 'spaces'].includes(photo.category), 'Choose a supported gallery category.');
    require(mediaPath(photo.file), 'Each photo needs a local image.');
    if (photo.thumb) mediaPath(photo.thumb);
  }
  require(c.faqs?.length >= 1 && c.faqs.every(x => x.question?.trim() && x.answer?.trim()), 'FAQs need a question and answer.');
  return c;
}
