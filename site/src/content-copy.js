import { money } from './packages.js';

// Shared values keep edited rates and payment terms consistent with FAQ copy.
export function resolveContentCopy(source) {
  const content = structuredClone(source);
  const p = content.packages;
  const values = {
    surfOneDayRate: money(p.surfOnly.courses.find(x => x.days === 1).rate),
    vegMealRate: money(p.meals.find(x => x.id === 'veg').rate),
    nonVegMealRate: money(p.meals.find(x => x.id === 'nonVeg').rate),
    offerAmount: money(p.offer.amount),
    surfOnlyPayment: p.surfOnly.payment,
    staySurfPayment: p.staySurf.payment,
  };
  const resolve = text => text.replace(/\{\{(\w+)\}\}/g, (match, key) => values[key] ?? match);
  p.offer.label = resolve(p.offer.label);
  values.offerLabel = p.offer.label;
  values.offerTerms = p.offer.terms;
  content.learning.longer = resolve(content.learning.longer);
  content.faqs = content.faqs.map(faq => ({ ...faq, answer: resolve(faq.answer) }));
  return content;
}

export const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[c]);

export function escapeContent(value) {
  if (typeof value === 'string') return escapeHTML(value);
  if (Array.isArray(value)) return value.map(escapeContent);
  if (value && typeof value === 'object')
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, escapeContent(item)]));
  return value;
}
