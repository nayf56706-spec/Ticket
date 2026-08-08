const { buildTicketPanelEmbed, buildTicketPanelSelectRow } = require('../utils/embeds');
const perms = require('../utils/permissions');
const { noPermissionAdminEmbed } = require('../utils/embeds');

module.exports = {
  name: 'ticket',
  description: 'إرسال لوحة التذاكر.',
  async execute(message) {
    if (!perms.isManagement(message.member)) {
      return message.reply({ embeds: [noPermissionAdminEmbed()] });
    }
    const embed = buildTicketPanelEmbed();
    const row = buildTicketPanelSelectRow();
    await message.channel.send({ embeds: [embed], components: [row] });
    if (message.deletable) await message.delete().catch(() => {});
  },
};
