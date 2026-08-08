const { AttachmentBuilder } = require('discord.js');

function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * يجلب كل رسائل قناة التذكرة ويبني ملف HTML يمثل الـ Transcript
 */
async function generateTranscript(channel, ticket) {
  let allMessages = [];
  let lastId;

  // Discord limits fetch to 100 per call, so we page backwards until exhausted
  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;
    const batch = await channel.messages.fetch(options);
    if (batch.size === 0) break;
    allMessages.push(...batch.values());
    lastId = batch.last().id;
    if (batch.size < 100) break;
  }

  allMessages.reverse(); // من الأقدم إلى الأحدث

  const rows = allMessages
    .map((m) => {
      const time = new Date(m.createdTimestamp).toLocaleString('en-GB');
      const author = escapeHtml(m.author?.tag || 'Unknown');
      const content = escapeHtml(m.content || '');
      const attachments = [...m.attachments.values()]
        .map((a) => `<div class="attachment"><a href="${a.url}" target="_blank">${escapeHtml(a.name)}</a></div>`)
        .join('');
      return `
        <div class="message">
          <div class="meta"><span class="author">${author}</span> <span class="time">${time}</span></div>
          <div class="content">${content}</div>
          ${attachments}
        </div>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>NAXO Ticket Transcript - #${String(ticket.ticketNumber).padStart(3, '0')}</title>
<style>
  body { background:#313338; color:#dbdee1; font-family: Arial, sans-serif; padding:20px; }
  h1 { color:#fff; }
  .info { background:#2b2d31; padding:12px 16px; border-radius:8px; margin-bottom:20px; }
  .info div { margin:4px 0; }
  .message { border-bottom:1px solid #3f4147; padding:10px 0; }
  .meta { font-size:12px; color:#949ba4; }
  .author { font-weight:bold; color:#fff; margin-left:8px; }
  .content { margin-top:4px; white-space:pre-wrap; word-wrap:break-word; }
  .attachment { margin-top:4px; }
  .attachment a { color:#00a8fc; }
</style>
</head>
<body>
  <h1>NAXO TICKET TRANSCRIPT</h1>
  <div class="info">
    <div><b>Ticket:</b> #${String(ticket.ticketNumber).padStart(3, '0')}</div>
    <div><b>Owner:</b> ${escapeHtml(ticket.ownerTag)}</div>
    <div><b>Category:</b> ${escapeHtml(ticket.categoryLabel)}</div>
    <div><b>Created:</b> ${new Date(ticket.createdAt).toLocaleString('en-GB')}</div>
    <div><b>Closed:</b> ${new Date().toLocaleString('en-GB')}</div>
    <div><b>Closed By:</b> ${escapeHtml(ticket.closedByTag || '—')}</div>
  </div>
  ${rows || '<p>لا توجد رسائل.</p>'}
</body>
</html>`;

  const buffer = Buffer.from(html, 'utf8');
  return new AttachmentBuilder(buffer, {
    name: `transcript-${String(ticket.ticketNumber).padStart(3, '0')}.html`,
  });
}

module.exports = { generateTranscript };
