const storage = require('../utils/storage');
const perms = require('../utils/permissions');
const embeds = require('../utils/embeds');
const ticketManager = require('../utils/ticketManager');

module.exports = {
  name: 'close',
  description: 'إغلاق التذكرة الحالية.',
  async execute(message) {
    const ticket = storage.getTicketByChannel(message.channel.id);
    if (!ticket) {
      return message.reply('هذه القناة ليست تذكرة.');
    }

    // صاحب التذكرة لا يستطيع إغلاق التذكرة أو حذفها بنفسه
    if (!perms.canCloseOrDelete(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionCloseEmbed()] });
    }

    await ticketManager.promptClose(message.channel);
  },
};
