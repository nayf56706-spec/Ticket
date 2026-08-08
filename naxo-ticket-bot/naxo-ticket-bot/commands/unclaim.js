const storage = require('../utils/storage');
const perms = require('../utils/permissions');
const embeds = require('../utils/embeds');
const ticketManager = require('../utils/ticketManager');

module.exports = {
  name: 'unclaim',
  description: 'إلغاء استلام التذكرة.',
  async execute(message) {
    const ticket = storage.getTicketByChannel(message.channel.id);
    if (!ticket) return message.reply('هذه القناة ليست تذكرة.');

    if (!perms.canClaim(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionAdminEmbed()] });
    }

    if (!ticket.claimedBy) {
      return message.reply('هذه التذكرة غير مُستلمة أصلاً.');
    }

    // فقط من استلمها أو الإدارة العليا (Owner/Administrator) يستطيع إلغاء الاستلام
    const isClaimant = ticket.claimedBy === message.author.id;
    if (!isClaimant && !perms.canCloseOrDelete(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionAdminEmbed()] });
    }

    storage.updateTicket(message.channel.id, { claimedBy: null });
    await message.channel.send({ embeds: [embeds.ticketUnclaimedEmbed()] });
    await ticketManager.sendLog(message.guild, {
      ticketNumber: ticket.ticketNumber,
      user: { id: ticket.ownerId },
      categoryLabel: ticket.categoryLabel,
      action: 'Ticket Unclaimed',
      staff: message.author,
    });
  },
};
