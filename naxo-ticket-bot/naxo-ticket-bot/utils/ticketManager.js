const { ChannelType, PermissionFlagsBits } = require('discord.js');
const config = require('../config');
const storage = require('./storage');
const embeds = require('./embeds');
const { generateTranscript } = require('./transcript');

/** ينشئ قناة تذكرة جديدة لعضو ضمن قسم معيّن */
async function createTicket(guild, member, categoryKey) {
  const category = config.categories[categoryKey];
  if (!category) throw new Error('Unknown category: ' + categoryKey);

  // منع فتح أكثر من تذكرة (Maximum Open Tickets: 1)
  const existing = storage.getOpenTicketByOwner(member.id, guild.id);
  if (existing) {
    return { alreadyOpen: true, ticket: existing };
  }

  const { global, category: catNumber } = storage.nextNumber(categoryKey);
  const channelName = `${category.prefix}-${String(catNumber).padStart(3, '0')}`;

  const overwrites = [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: member.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.AttachFiles,
      ],
    },
  ];
  if (config.supportRoleId) {
    overwrites.push({
      id: config.supportRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
      ],
    });
  }
  if (config.staffRoleId) {
    overwrites.push({
      id: config.staffRoleId,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageMessages,
      ],
    });
  }

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    parent: config.ticketCategoryId || undefined,
    permissionOverwrites: overwrites,
  });

  const ticket = {
    channelId: channel.id,
    guildId: guild.id,
    ownerId: member.id,
    ownerTag: member.user.tag,
    categoryKey,
    categoryLabel: category.label,
    ticketNumber: global,
    categoryNumber: catNumber,
    status: 'open',
    claimedBy: null,
    createdAt: Date.now(),
    closedByTag: null,
  };
  storage.addTicket(ticket);

  const welcomeEmbed = embeds.buildTicketWelcomeEmbed({
    user: member.user,
    categoryLabel: category.label,
    number: global,
  });
  const buttonsRow = embeds.buildTicketButtonsRow({ claimed: false });

  await channel.send({
    content: `<@${member.id}>${config.supportRoleId ? ` <@&${config.supportRoleId}>` : ''}`,
    embeds: [welcomeEmbed],
    components: [buttonsRow],
  });

  await sendLog(guild, {
    ticketNumber: global,
    user: member.user,
    categoryLabel: category.label,
    action: 'Ticket Created',
    staff: null,
  });

  return { alreadyOpen: false, ticket, channel };
}

/** يرسل رسالة تأكيد قبل إغلاق التذكرة */
async function promptClose(channel) {
  const embed = embeds.closeConfirmPromptEmbed();
  const row = embeds.buildCloseConfirmRow();
  return channel.send({ embeds: [embed], components: [row] });
}

/** ينفّذ إغلاق التذكرة فعلياً (تعطيل الكتابة لصاحب التذكرة + إشعار) */
async function closeTicket(channel, ticket, staffMember) {
  storage.updateTicket(channel.id, {
    status: 'closed',
    closedByTag: staffMember.user.tag,
    closedAt: Date.now(),
  });

  // منع صاحب التذكرة من إرسال رسائل جديدة
  await channel.permissionOverwrites.edit(ticket.ownerId, {
    SendMessages: false,
  });

  const closedEmbed = embeds.ticketClosedEmbed({
    ticketNumber: ticket.ticketNumber,
    staff: staffMember.user,
  });
  await channel.send({ embeds: [closedEmbed] });

  await sendLog(channel.guild, {
    ticketNumber: ticket.ticketNumber,
    user: { id: ticket.ownerId },
    categoryLabel: ticket.categoryLabel,
    action: 'Ticket Closed',
    staff: staffMember.user,
  });

  // حفظ Transcript ثم حذف القناة تلقائياً
  if (config.transcriptSystemEnabled) {
    await saveTranscript(channel, storage.getTicketByChannel(channel.id) || ticket);
  }

  await channel.send({ embeds: [embeds.ticketClosedSuccessEmbed()] });

  setTimeout(async () => {
    try {
      await deleteTicketChannel(channel, storage.getTicketByChannel(channel.id) || ticket);
    } catch (e) {
      console.error('Auto-delete failed:', e);
    }
  }, 5000);
}

/** يحذف قناة التذكرة (مع حفظ Transcript إن لم يُحفظ سابقاً) */
async function deleteTicketChannel(channel, ticket) {
  if (config.transcriptSystemEnabled && !ticket.transcriptSaved) {
    await saveTranscript(channel, ticket);
  }

  await sendLog(channel.guild, {
    ticketNumber: ticket.ticketNumber,
    user: { id: ticket.ownerId },
    categoryLabel: ticket.categoryLabel,
    action: 'Ticket Deleted',
    staff: null,
  });

  storage.removeTicket(channel.id);
  await channel.delete().catch(() => {});
}

/** ينشئ Transcript ويرسله إلى قناة الـ Transcript */
async function saveTranscript(channel, ticket) {
  const attachment = await generateTranscript(channel, ticket);
  const transcriptChannel = channel.guild.channels.cache.get(config.transcriptChannelId);
  if (transcriptChannel) {
    await transcriptChannel.send({
      content: `Transcript — #${String(ticket.ticketNumber).padStart(3, '0')} (${ticket.ownerTag})`,
      files: [attachment],
    });
  }
  storage.updateTicket(channel.id, { transcriptSaved: true });
  return attachment;
}

/** يرسل سجل الحدث إلى قناة اللوق */
async function sendLog(guild, { ticketNumber, user, categoryLabel, action, staff }) {
  const logChannel = guild.channels.cache.get(config.logChannelId);
  if (!logChannel) return;
  const embed = embeds.logEmbed({ ticketNumber, user, categoryLabel, action, staff });
  await logChannel.send({ embeds: [embed] }).catch(() => {});
}

module.exports = {
  createTicket,
  promptClose,
  closeTicket,
  deleteTicketChannel,
  saveTranscript,
  sendLog,
};
