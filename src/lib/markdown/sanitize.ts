import DOMPurify from "dompurify";
import { marked } from "marked";

/**
 * Markdownを安全なHTMLに変換
 * XSS対策のためDOMPurifyでサニタイズ
 */
export function sanitizeMarkdown(markdown: string): string {
  // Markedでmarkdown → HTML変換
  const rawHtml = marked.parse(markdown, {
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // 改行を<br>に変換
  }) as string;

  // DOMPurifyでサニタイズ
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "code",
      "pre",
      "blockquote",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "hr",
      "div",
      "span",
    ],
    ALLOWED_ATTR: [
      "href",
      "src",
      "alt",
      "title",
      "class",
      "id",
      "target",
      "rel",
    ],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });

  return cleanHtml;
}

/**
 * プレーンテキストからHTMLエスケープ
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Markdownのプレビュー用（簡易版・クライアント側）
 */
export function renderMarkdownPreview(markdown: string): string {
  return sanitizeMarkdown(markdown);
}
