/** Turn text supplied by the person posting into a draft, never into a published listing. */
export function prefillOwnSublet(text) {
  const cleaned = String(text || '').trim().slice(0, 4000);
  const firstLine = cleaned.split(/\r?\n/).map(line => line.trim()).find(Boolean) || '';
  const priceMatch = cleaned.match(/\$\s*([\d,]+)(?:\.\d{2})?\s*(?:\/\s*(?:mo(?:nth)?|person)|per\s+(?:month|person)|monthly|rent\b)/i);
  const price = priceMatch ? Number(priceMatch[1].replaceAll(',', '')) : null;

  return {
    title: firstLine.slice(0, 120),
    description: cleaned,
    price: Number.isFinite(price) && price > 0 ? String(price) : '',
  };
}
