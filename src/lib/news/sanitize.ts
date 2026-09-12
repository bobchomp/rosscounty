import sanitizeHtml from "sanitize-html";

// Matches what the TipTap editor (StarterKit + Image + Link) can produce.
// Using sanitize-html rather than isomorphic-dompurify — the latter bundles
// jsdom, which has broken ESM/CJS interop under Vercel's serverless bundler
// (fails at runtime with "require() of ES Module ... not supported").
export function sanitizeArticleHtml(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "hr",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "s", "strike", "code", "pre",
      "blockquote", "ul", "ol", "li", "a", "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}
