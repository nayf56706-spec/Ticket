const storage = require('../utils/storage');
const perms = require('../utils/permissions');
const embeds = require('../utils/embeds');

module.exports = {
  name: 'remove',
  description: 'إزالة عضو من التذكرة. الاستخدام: -remove @User',
  async execute(message) {
    const ticket = storage.getTicketByChannel(message.channel.id);
    if (!ticket) return message.reply('هذه القناة ليست تذكرة.');

    if (!perms.canAddRemoveMembers(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionAdminEmbed()] });
    }

    const target = message.mentions.members?.first();
    if (!target) {
      return message.reply('يرجى منشن العضو الذي تريد إزالته. مثال: `-remove @User`');
    }

    if (target.id === ticket.ownerId) {
      return message.reply('لا يمكن إزالة صاحب التذكرة منها.');
    }

    await message.channel.permissionOverwrites.delete(target.id).catch(() => {});
    await message.channel.send(`تمت إزالة <@${target.id}> من التذكرة.`);
  },
};
