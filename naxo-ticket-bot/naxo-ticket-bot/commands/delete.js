const storage = require('../utils/storage');
const perms = require('../utils/permissions');
const embeds = require('../utils/embeds');
const ticketManager = require('../utils/ticketManager');

module.exports = {
  name: 'delete',
  description: 'حذف التذكرة الحالية.',
  async execute(message) {
    const ticket = storage.getTicketByChannel(message.channel.id);
    if (!ticket) {
      return message.reply('هذه القناة ليست تذكرة.');
    }

    if (!perms.canCloseOrDelete(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionCloseEmbed()] });
    }

    await message.channel.send({
      embeds: [embeds.ticketDeletedEmbed({ ticketNumber: ticket.ticketNumber })],
    });
    await ticketManager.deleteTicketChannel(message.channel, ticket);
  },
};
