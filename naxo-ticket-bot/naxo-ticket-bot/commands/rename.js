const storage = require('../utils/storage');
const perms = require('../utils/permissions');
const embeds = require('../utils/embeds');

module.exports = {
  name: 'rename',
  description: 'تغيير اسم التذكرة. الاستخدام: -rename الاسم-الجديد',
  async execute(message, args) {
    const ticket = storage.getTicketByChannel(message.channel.id);
    if (!ticket) return message.reply('هذه القناة ليست تذكرة.');

    if (!perms.canRenameOrTranscript(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionAdminEmbed()] });
    }

    const newName = args.join('-').trim();
    if (!newName) {
      return message.reply('يرجى كتابة الاسم الجديد. مثال: `-rename urgent-issue`');
    }

    await message.channel.setName(newName);
    await message.channel.send(`تم تغيير اسم التذكرة إلى **${newName}**.`);
  },
};
