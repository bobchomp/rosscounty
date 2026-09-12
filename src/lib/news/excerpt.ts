function decodeBasicEntities(text: string) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Plain-text summary pulled from the start of the article body, used on
// cards and as the meta description — no manual excerpt field to fill in.
export function extractExcerpt(bodyHtml: string, maxLength = 160): string {
  const text = decodeBasicEntities(bodyHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")).trim();

  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const cut = lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated;
  return `${cut.trim()}…`;
}
