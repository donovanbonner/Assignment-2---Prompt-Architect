function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderMarkdown(raw) {
  const escaped = escapeHtml(raw);

  // Fenced code blocks: ```lang\n...\n```
  let html = escaped.replace(
    /```[\w]*\n([\s\S]*?)```/g,
    (_, code) => `<pre><code>${code.trimEnd()}</code></pre>`
  );

  // Inline code: `...`
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');

  // Bold: **...**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic: *...*
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Headings: ### and ####
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h3>$1</h3>');

  // Numbered lists: lines starting with "1. ", "2. ", etc.
  html = html.replace(
    /((?:^\d+\. .+\n?)+)/gm,
    (block) => {
      const items = block.trim().split('\n').map(
        (line) => `<li>${line.replace(/^\d+\.\s+/, '')}</li>`
      );
      return `<ol>${items.join('')}</ol>`;
    }
  );

  // Unordered lists: lines starting with "- " or "* "
  html = html.replace(
    /((?:^[-*] .+\n?)+)/gm,
    (block) => {
      const items = block.trim().split('\n').map(
        (line) => `<li>${line.replace(/^[-*]\s+/, '')}</li>`
      );
      return `<ul>${items.join('')}</ul>`;
    }
  );

  // Paragraphs: split on double newlines, wrap non-block content in <p>
  const blocks = html.split(/\n{2,}/);
  html = blocks
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      if (/^<(h[34]|pre|ul|ol|li|blockquote)/.test(b)) return b;
      return `<p>${b.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');

  return html;
}
