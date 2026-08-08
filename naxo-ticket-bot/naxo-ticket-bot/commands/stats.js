const storage = require('../utils/storage');
const embeds = require('../utils/embeds');

module.exports = {
  name: 'stats',
  description: 'عرض إحصائيات التذاكر.',
  async execute(message) {
    const stats = storage.getStats(message.guild.id, message.author.id);
    await message.channel.send({ embeds: [embeds.statsEmbed(stats)] });
  },
};
