const storage = require('../utils/storage');
const perms = require('../utils/permissions');
const embeds = require('../utils/embeds');
const ticketManager = require('../utils/ticketManager');
const config = require('../config');

module.exports = {
  name: 'claim',
  description: 'استلام التذكرة.',
  async execute(message) {
    if (!config.claimSystemEnabled) {
      return message.reply('نظام الاستلام غير مفعّل حالياً.');
    }
    const ticket = storage.getTicketByChannel(message.channel.id);
    if (!ticket) return message.reply('هذه القناة ليست تذكرة.');

    if (!perms.canClaim(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionAdminEmbed()] });
    }

    if (ticket.claimedBy) {
      return message.reply({ embeds: [embeds.alreadyClaimedEmbed(ticket.claimedBy)] });
    }

    storage.updateTicket(message.channel.id, { claimedBy: message.author.id });
    await message.channel.send({
      embeds: [embeds.ticketClaimedEmbed({ staff: message.author })],
    });
    await ticketManager.sendLog(message.guild, {
      ticketNumber: ticket.ticketNumber,
      user: { id: ticket.ownerId },
      categoryLabel: ticket.categoryLabel,
      action: 'Ticket Claimed',
      staff: message.author,
    });
  },
};
