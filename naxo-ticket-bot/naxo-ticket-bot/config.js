require('dotenv').config();
const staticConfig = require('./config.json');

module.exports = {
  // ---- أسرار من .env (لا تُرفع أبداً لقيتهب) ----
  token: process.env.DISCORD_TOKEN,
  guildId: process.env.GUILD_ID,
  ticketCategoryId: process.env.TICKET_CATEGORY_ID,
  ownerRoleId: process.env.OWNER_ROLE_ID,
  adminRoleId: process.env.ADMIN_ROLE_ID,
  staffRoleId: process.env.STAFF_ROLE_ID,
  supportRoleId: process.env.SUPPORT_ROLE_ID,
  transcriptChannelId: process.env.TRANSCRIPT_CHANNEL_ID,
  logChannelId: process.env.LOG_CHANNEL_ID,

  // ---- إعدادات ثابتة غير سرية من config.json (آمن رفعها لقيتهب) ----
  ...staticConfig,
};
