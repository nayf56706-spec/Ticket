const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');
const storage = require('../utils/storage');
const perms = require('../utils/permissions');
const embeds = require('../utils/embeds');
const ticketManager = require('../utils/ticketManager');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    try {
      if (interaction.isStringSelectMenu() && interaction.customId === 'naxo_ticket_category_select') {
        await handleCategorySelect(interaction);
        return;
      }

      if (interaction.isButton()) {
        switch (interaction.customId) {
          case 'naxo_ticket_claim':
            return handleClaimButton(interaction);
          case 'naxo_ticket_close':
            return handleCloseButton(interaction);
          case 'naxo_ticket_close_confirm':
            return handleCloseConfirm(interaction);
          case 'naxo_ticket_close_cancel':
            return handleCloseCancel(interaction);
          case 'naxo_ticket_add':
            return openMemberModal(interaction, 'add');
          case 'naxo_ticket_remove':
            return openMemberModal(interaction, 'remove');
        }
      }

      if (interaction.isModalSubmit()) {
        if (interaction.customId === 'naxo_add_member_modal') return handleAddModal(interaction);
        if (interaction.customId === 'naxo_remove_member_modal') return handleRemoveModal(interaction);
      }
    } catch (err) {
      console.error('interactionCreate error:', err);
      if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
        await interaction
          .reply({ content: 'حدث خطأ أثناء تنفيذ العملية.', ephemeral: true })
          .catch(() => {});
      }
    }
  },
};

async function handleCategorySelect(interaction) {
  await interaction.deferReply({ ephemeral: true });
  const categoryKey = interaction.values[0];
  const result = await ticketManager.createTicket(interaction.guild, interaction.member, categoryKey);

  if (result.alreadyOpen) {
    return interaction.editReply({
      embeds: [embeds.alreadyHasOpenTicketEmbed(result.ticket.channelId)],
    });
  }

  await interaction.editReply({
    content: `تم إنشاء تذكرتك: <#${result.channel.id}>`,
  });
}

async function handleClaimButton(interaction) {
  const ticket = storage.getTicketByChannel(interaction.channel.id);
  if (!ticket) return interaction.reply({ content: 'هذه القناة ليست تذكرة.', ephemeral: true });

  if (!perms.canClaim(interaction.member)) {
    return interaction.reply({ embeds: [embeds.noPermissionAdminEmbed()], ephemeral: true });
  }

  if (ticket.claimedBy && ticket.claimedBy === interaction.user.id) {
    // إلغاء الاستلام عبر نفس الزر
    storage.updateTicket(interaction.channel.id, { claimedBy: null });
    await interaction.update({
      components: [embeds.buildTicketButtonsRow({ claimed: false })],
    });
    await interaction.channel.send({ embeds: [embeds.ticketUnclaimedEmbed()] });
    return;
  }

  if (ticket.claimedBy) {
    return interaction.reply({
      embeds: [embeds.alreadyClaimedEmbed(ticket.claimedBy)],
      ephemeral: true,
    });
  }

  storage.updateTicket(interaction.channel.id, { claimedBy: interaction.user.id });
  await interaction.update({
    components: [embeds.buildTicketButtonsRow({ claimed: true })],
  });
  await interaction.channel.send({
    embeds: [embeds.ticketClaimedEmbed({ staff: interaction.user })],
  });
  await ticketManager.sendLog(interaction.guild, {
    ticketNumber: ticket.ticketNumber,
    user: { id: ticket.ownerId },
    categoryLabel: ticket.categoryLabel,
    action: 'Ticket Claimed',
    staff: interaction.user,
  });
}

async function handleCloseButton(interaction) {
  const ticket = storage.getTicketByChannel(interaction.channel.id);
  if (!ticket) return interaction.reply({ content: 'هذه القناة ليست تذكرة.', ephemeral: true });

  if (!perms.canCloseOrDelete(interaction.member)) {
    return interaction.reply({ embeds: [embeds.noPermissionCloseEmbed()], ephemeral: true });
  }

  await interaction.reply({
    embeds: [embeds.closeConfirmPromptEmbed()],
    components: [embeds.buildCloseConfirmRow()],
  });
}

async function handleCloseConfirm(interaction) {
  const ticket = storage.getTicketByChannel(interaction.channel.id);
  if (!ticket) return interaction.reply({ content: 'هذه القناة ليست تذكرة.', ephemeral: true });

  if (!perms.canCloseOrDelete(interaction.member)) {
    return interaction.reply({ embeds: [embeds.noPermissionCloseEmbed()], ephemeral: true });
  }

  await interaction.update({ content: 'جارٍ الإغلاق...', embeds: [], components: [] });
  await ticketManager.closeTicket(interaction.channel, ticket, interaction.member);
}

async function handleCloseCancel(interaction) {
  await interaction.update({ content: 'تم إلغاء عملية الإغلاق.', embeds: [], components: [] });
}

async function openMemberModal(interaction, mode) {
  const ticket = storage.getTicketByChannel(interaction.channel.id);
  if (!ticket) return interaction.reply({ content: 'هذه القناة ليست تذكرة.', ephemeral: true });

  if (!perms.canAddRemoveMembers(interaction.member)) {
    return interaction.reply({ embeds: [embeds.noPermissionAdminEmbed()], ephemeral: true });
  }

  const modal = new ModalBuilder()
    .setCustomId(mode === 'add' ? 'naxo_add_member_modal' : 'naxo_remove_member_modal')
    .setTitle(mode === 'add' ? 'إضافة عضو' : 'إزالة عضو');

  const input = new TextInputBuilder()
    .setCustomId('user_id')
    .setLabel('معرّف العضو (User ID)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('مثال: 123456789012345678')
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  await interaction.showModal(modal);
}

async function handleAddModal(interaction) {
  const userId = interaction.fields.getTextInputValue('user_id').trim();
  const member = await interaction.guild.members.fetch(userId).catch(() => null);
  if (!member) {
    return interaction.reply({ content: 'تعذر العثور على هذا العضو.', ephemeral: true });
  }

  await interaction.channel.permissionOverwrites.edit(member.id, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
  });

  await interaction.reply({ content: `تمت إضافة <@${member.id}> إلى التذكرة.` });
}

async function handleRemoveModal(interaction) {
  const ticket = storage.getTicketByChannel(interaction.channel.id);
  const userId = interaction.fields.getTextInputValue('user_id').trim();

  if (ticket && userId === ticket.ownerId) {
    return interaction.reply({ content: 'لا يمكن إزالة صاحب التذكرة منها.', ephemeral: true });
  }

  await interaction.channel.permissionOverwrites.delete(userId).catch(() => {});
  await interaction.reply({ content: `تمت إزالة <@${userId}> من التذكرة.` });
}
