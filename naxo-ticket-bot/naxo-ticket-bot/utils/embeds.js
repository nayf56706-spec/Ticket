const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const config = require('../config');

// ---------- لوحة التذاكر ----------

function buildTicketPanelEmbed() {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('نظام التذاكر')
    .setDescription(
      [
        'مرحباً بك في نظام الدعم الخاص بـ **NAXO**.',
        '',
        'إذا كنت تحتاج إلى مساعدة من الإدارة، قم بفتح تذكرة واختيار القسم المناسب.',
        '',
        'يرجى التأكد من أن سبب فتح التذكرة واضح ومحدد، وعدم فتح أكثر من تذكرة لنفس الموضوع.',
        '',
        '**الأقسام المتوفرة:**',
        ...Object.values(config.categories).map(
          (c) => `${c.emoji} **${c.label}** — ${c.description}`
        ),
      ].join('\n')
    )
    .setFooter({ text: 'NAXO TICKET SYSTEM' });
}

function buildTicketPanelSelectRow() {
  const select = new StringSelectMenuBuilder()
    .setCustomId('naxo_ticket_category_select')
    .setPlaceholder('اختر القسم المناسب لفتح تذكرة')
    .addOptions(
      Object.entries(config.categories).map(([key, c]) => ({
        label: c.label,
        description: c.description,
        value: key,
        emoji: c.emoji,
      }))
    );
  return new ActionRowBuilder().addComponents(select);
}

// ---------- داخل التذكرة ----------

function buildTicketWelcomeEmbed({ user, categoryLabel, number }) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('تذكرة الدعم')
    .setDescription(
      [
        'مرحباً بك في تذكرتك.',
        '',
        'يرجى كتابة طلبك أو مشكلتك بالتفصيل حتى يتمكن فريق الإدارة من مساعدتك بشكل أسرع.',
      ].join('\n')
    )
    .addFields(
      { name: 'صاحب التذكرة', value: `<@${user.id}>`, inline: true },
      { name: 'القسم', value: categoryLabel, inline: true },
      { name: 'رقم التذكرة', value: `#${String(number).padStart(3, '0')}`, inline: true }
    )
    .setFooter({
      text: 'إغلاق التذكرة وحذفها متاحان للإدارة فقط. صاحب التذكرة لا يستطيع إغلاق التذكرة أو حذفها بنفسه.',
    });
}

function buildTicketButtonsRow({ claimed = false } = {}) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('naxo_ticket_claim')
      .setLabel(claimed ? 'إلغاء الاستلام' : 'استلام التذكرة')
      .setStyle(claimed ? ButtonStyle.Secondary : ButtonStyle.Primary)
      .setEmoji('🙋'),
    new ButtonBuilder()
      .setCustomId('naxo_ticket_close')
      .setLabel('إغلاق التذكرة')
      .setStyle(ButtonStyle.Danger)
      .setEmoji('🔒'),
    new ButtonBuilder()
      .setCustomId('naxo_ticket_add')
      .setLabel('إضافة عضو')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('➕'),
    new ButtonBuilder()
      .setCustomId('naxo_ticket_remove')
      .setLabel('إزالة عضو')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('➖')
  );
  return row;
}

function buildCloseConfirmRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('naxo_ticket_close_confirm')
      .setLabel('تأكيد الإغلاق')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId('naxo_ticket_close_cancel')
      .setLabel('إلغاء')
      .setStyle(ButtonStyle.Secondary)
  );
}

// ---------- رسائل الأنظمة ----------

function noPermissionCloseEmbed() {
  return new EmbedBuilder()
    .setColor('Red')
    .setDescription(
      ['ليس لديك صلاحية لإغلاق هذه التذكرة.', '', 'إغلاق التذاكر متاح للإدارة فقط.'].join('\n')
    );
}

function noPermissionAdminEmbed() {
  return new EmbedBuilder()
    .setColor('Red')
    .setDescription(
      ['ليس لديك صلاحية لاستخدام هذا الأمر.', '', 'هذا الأمر متاح للإدارة فقط.'].join('\n')
    );
}

function alreadyHasOpenTicketEmbed(ticketChannelId) {
  return new EmbedBuilder()
    .setColor('Orange')
    .setDescription(
      [
        'لديك تذكرة مفتوحة بالفعل.',
        '',
        `التذكرة: <#${ticketChannelId}>`,
        '',
        'يرجى الانتظار حتى يتم إغلاق التذكرة الحالية قبل فتح تذكرة جديدة.',
      ].join('\n')
    );
}

function closeConfirmPromptEmbed() {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setDescription(
      [
        'هل أنت متأكد من إغلاق هذه التذكرة؟',
        '',
        'بعد الإغلاق لن يتمكن صاحب التذكرة من إرسال رسائل جديدة.',
      ].join('\n')
    );
}

function ticketClosedEmbed({ ticketNumber, staff }) {
  return new EmbedBuilder()
    .setColor('Red')
    .setDescription(
      [
        'تم إغلاق التذكرة.',
        '',
        `التذكرة: #${String(ticketNumber).padStart(3, '0')}`,
        `بواسطة: <@${staff.id}>`,
        '',
        'سيتم حفظ نسخة من المحادثة قبل حذف التذكرة.',
      ].join('\n')
    );
}

function ticketClosedSuccessEmbed() {
  return new EmbedBuilder()
    .setColor('Green')
    .setDescription(
      [
        'تم إغلاق التذكرة بنجاح.',
        '',
        'تم حفظ نسخة من المحادثة وإرسالها إلى سجل التذاكر.',
        'سيتم حذف التذكرة تلقائياً بعد حفظ الـ Transcript.',
      ].join('\n')
    );
}

function ticketDeletedEmbed({ ticketNumber }) {
  return new EmbedBuilder()
    .setColor('Red')
    .setDescription(
      [
        'تم حذف التذكرة.',
        '',
        `التذكرة: #${String(ticketNumber).padStart(3, '0')}`,
        '',
        'تم إنشاء نسخة من المحادثة وإرسالها إلى سجل التذاكر.',
      ].join('\n')
    );
}

function ticketClaimedEmbed({ staff }) {
  return new EmbedBuilder()
    .setColor('Blue')
    .setDescription(
      [
        'تم استلام التذكرة.',
        '',
        `المسؤول عن التذكرة: <@${staff.id}>`,
        '',
        'يرجى انتظار معالجة طلبك.',
      ].join('\n')
    );
}

function ticketUnclaimedEmbed() {
  return new EmbedBuilder().setColor('Grey').setDescription('تم إلغاء استلام التذكرة.');
}

function alreadyClaimedEmbed(staffId) {
  return new EmbedBuilder()
    .setColor('Orange')
    .setDescription(
      `هذه التذكرة مُستلمة بالفعل من قِبل <@${staffId}>. لا يمكن استلامها إلا بعد إلغاء الاستلام.`
    );
}

function statsEmbed({ total, open, closed, userTickets }) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('Ticket Statistics')
    .addFields(
      { name: 'Total Tickets', value: `${total}`, inline: true },
      { name: 'Open Tickets', value: `${open}`, inline: true },
      { name: 'Closed Tickets', value: `${closed}`, inline: true },
      { name: 'Your Tickets', value: `${userTickets}`, inline: true }
    );
}

function logEmbed({ ticketNumber, user, categoryLabel, action, staff }) {
  return new EmbedBuilder()
    .setColor(config.embedColor)
    .setTitle('Ticket Logs')
    .addFields(
      { name: 'Ticket', value: `#${String(ticketNumber).padStart(3, '0')}`, inline: true },
      { name: 'User', value: `<@${user.id}>`, inline: true },
      { name: 'Category', value: categoryLabel, inline: true },
      { name: 'Action', value: action, inline: true },
      { name: 'Staff', value: staff ? `<@${staff.id}>` : '—', inline: true },
      { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
    );
}

module.exports = {
  buildTicketPanelEmbed,
  buildTicketPanelSelectRow,
  buildTicketWelcomeEmbed,
  buildTicketButtonsRow,
  buildCloseConfirmRow,
  noPermissionCloseEmbed,
  noPermissionAdminEmbed,
  alreadyHasOpenTicketEmbed,
  closeConfirmPromptEmbed,
  ticketClosedEmbed,
  ticketClosedSuccessEmbed,
  ticketDeletedEmbed,
  ticketClaimedEmbed,
  ticketUnclaimedEmbed,
  alreadyClaimedEmbed,
  statsEmbed,
  logEmbed,
};
