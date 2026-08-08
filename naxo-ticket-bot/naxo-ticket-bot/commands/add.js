const { PermissionFlagsBits } = require('discord.js');
const storage = require('../utils/storage');
const perms = require('../utils/permissions');
const embeds = require('../utils/embeds');

module.exports = {
  name: 'add',
  description: 'إضافة عضو إلى التذكرة. الاستخدام: -add @User',
  async execute(message, args) {
    const ticket = storage.getTicketByChannel(message.channel.id);
    if (!ticket) return message.reply('هذه القناة ليست تذكرة.');

    if (!perms.canAddRemoveMembers(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionAdminEmbed()] });
    }

    const target = message.mentions.members?.first();
    if (!target) {
      return message.reply('يرجى منشن العضو الذي تريد إضافته. مثال: `-add @User`');
    }

    await message.channel.permissionOverwrites.edit(target.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    await message.channel.send(`تمت إضافة <@${target.id}> إلى التذكرة.`);
  },
};
