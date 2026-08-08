const storage = require('../utils/storage');
const perms = require('../utils/permissions');
const embeds = require('../utils/embeds');
const ticketManager = require('../utils/ticketManager');
const config = require('../config');

module.exports = {
  name: 'transcript',
  description: 'حفظ نسخة من محادثة التذكرة.',
  async execute(message) {
    if (!config.transcriptSystemEnabled) {
      return message.reply('نظام الـ Transcript غير مفعّل حالياً.');
    }
    const ticket = storage.getTicketByChannel(message.channel.id);
    if (!ticket) return message.reply('هذه القناة ليست تذكرة.');

    if (!perms.canRenameOrTranscript(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionAdminEmbed()] });
    }

    await ticketManager.saveTranscript(message.channel, ticket);
    await message.reply('تم حفظ نسخة من المحادثة وإرسالها إلى قناة السجل.');
  },
};
