#!/usr/bin/env bash
set -e
# سكربت واحد ينشئ مشروع NAXO TICKET BOT بالكامل بمجرد تشغيله
echo "==> إنشاء مجلدات ومكونات المشروع..."
mkdir -p naxo-ticket-bot
cd naxo-ticket-bot
cat > '.env.example' << 'NAXO_EOF_MARKER_9f3k'
# انسخ هذا الملف باسم .env واملأ القيم الحقيقية
# لا تضع القيم الحقيقية هنا وترفعها لقيتهب — هذا الملف مجرد مثال (Template)
 
DISCORD_TOKEN=PUT_YOUR_BOT_TOKEN_HERE
GUILD_ID=PUT_YOUR_SERVER_ID_HERE
 
TICKET_CATEGORY_ID=PUT_TICKET_CATEGORY_ID_HERE
 
OWNER_ROLE_ID=PUT_OWNER_ROLE_ID_HERE
ADMIN_ROLE_ID=PUT_ADMINISTRATOR_ROLE_ID_HERE
STAFF_ROLE_ID=PUT_STAFF_ROLE_ID_HERE
SUPPORT_ROLE_ID=PUT_SUPPORT_ROLE_ID_HERE
 
TRANSCRIPT_CHANNEL_ID=PUT_TRANSCRIPT_CHANNEL_ID_HERE
LOG_CHANNEL_ID=PUT_LOG_CHANNEL_ID_HERE
NAXO_EOF_MARKER_9f3k
 
mkdir -p '.github/workflows'
cat > '.github/workflows/ci.yml' << 'NAXO_EOF_MARKER_9f3k'
name: CI - Syntax Check
 
on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]
 
jobs:
  syntax-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
 
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
 
      - name: Install dependencies
        run: npm install
 
      - name: Check syntax of every JS file
        run: |
          for f in $(find . -name "*.js" -not -path "./node_modules/*"); do
            echo "Checking $f"
            node --check "$f"
          done
NAXO_EOF_MARKER_9f3k
 
cat > '.gitignore' << 'NAXO_EOF_MARKER_9f3k'
# تبعيات Node
node_modules/
 
# الأسرار — لا تُرفع أبداً
.env
 
# بيانات وقت التشغيل (تُنشأ تلقائياً)
data/*.json
 
# ملفات نظام التشغيل والمحررات
.DS_Store
*.log
.vscode/
NAXO_EOF_MARKER_9f3k
 
cat > 'README.md' << 'NAXO_EOF_MARKER_9f3k'
# NAXO TICKET BOT 🎫
 
بوت تذاكر (Ticket System) كامل لسيرفر ديسكورد، مبني بـ **discord.js v14**، ومطابق تماماً للمواصفات الموجودة في ملفك (نفس النصوص والرسائل والأوامر بالعربي).
 
## المحتويات
 
```
naxo-ticket-bot/
├── index.js                 # نقطة تشغيل البوت
├── config.json              # كل الإعدادات (Token, الرولات, القنوات...)
├── package.json
├── commands/                # كل أمر بادئة (-ticket, -close, ...) في ملف مستقل
│   ├── ticket.js
│   ├── close.js
│   ├── delete.js
│   ├── claim.js
│   ├── unclaim.js
│   ├── add.js
│   ├── remove.js
│   ├── rename.js
│   ├── transcript.js
│   └── stats.js
├── events/
│   ├── messageCreate.js     # معالجة أوامر البادئة
│   └── interactionCreate.js # معالجة الأزرار وقائمة اختيار القسم والـ Modals
├── utils/
│   ├── storage.js           # تخزين التذاكر والعدادات في ملفات JSON
│   ├── permissions.js       # نظام الصلاحيات (Owner/Administrator/Staff/Member)
│   ├── embeds.js            # كل رسائل الإيمبد والأزرار بالنصوص العربية من ملفك
│   ├── ticketManager.js     # منطق إنشاء/إغلاق/حذف/استلام التذاكر
│   └── transcript.js        # توليد ملف HTML لمحادثة التذكرة
└── data/                    # يُنشأ تلقائياً (tickets.json, counters.json)
```
 
## 1) التثبيت
 
يتطلب Node.js إصدار 18 فأكثر.
 
```bash
cd naxo-ticket-bot
npm install
```
 
## 2) الإعداد (config.json)
 
افتح `config.json` وعبّئ القيم التالية من إعدادات السيرفر (Developer Mode مفعّل → كليك يمين → Copy ID):
 
| الحقل | الوصف |
|---|---|
| `token` | توكن البوت من [Discord Developer Portal](https://discord.com/developers/applications) |
| `guildId` | آيدي السيرفر |
| `ticketCategoryId` | آيدي الكاتيجوري اللي تُنشأ بداخله قنوات التذاكر |
| `ownerRoleId` | رول Owner (صلاحيات كاملة) |
| `adminRoleId` | رول Administrator |
| `staffRoleId` | رول Staff |
| `supportRoleId` | الرول اللي يشوف كل تذكرة تلقائياً (Support Role) |
| `transcriptChannelId` | القناة اللي تُحفظ فيها ملفات الـ Transcript |
| `logChannelId` | قناة سجل الأحداث (Ticket Logs) |
| `prefix` | بادئة الأوامر (افتراضياً `-`) |
| `maxOpenTickets` | الحد الأقصى للتذاكر المفتوحة لكل عضو (افتراضياً 1) |
| `claimSystemEnabled` / `transcriptSystemEnabled` | تفعيل/تعطيل النظامين |
 
**صلاحيات البوت المطلوبة عند الإضافة (Bot Permissions):**
`Manage Channels`, `View Channels`, `Send Messages`, `Manage Messages`, `Embed Links`, `Attach Files`, `Read Message History`.
 
**إنتنتس (Intents) الواجب تفعيلها من Developer Portal:**
`Server Members Intent`, `Message Content Intent`.
 
## 3) التشغيل
 
```bash
npm start
```
 
عند نجاح تسجيل الدخول سترى:
```
✅ NAXO TICKET BOT جاهز — مسجّل الدخول باسم YourBot#0000
```
 
## 4) الأوامر (طبقاً لملفك)
 
| الأمر | الوظيفة | الصلاحية |
|---|---|---|
| `-ticket` | إرسال لوحة التذاكر | الإدارة |
| `-close` | إغلاق التذكرة الحالية | Owner / Administrator |
| `-delete` | حذف التذكرة الحالية | Owner / Administrator |
| `-claim` | استلام التذكرة | Owner / Administrator / Staff |
| `-unclaim` | إلغاء استلام التذكرة | من استلمها أو Owner/Administrator |
| `-add @User` | إضافة عضو إلى التذكرة | Owner / Administrator / Staff |
| `-remove @User` | إزالة عضو من التذكرة | Owner / Administrator / Staff |
| `-rename الاسم` | تغيير اسم التذكرة | Owner / Administrator |
| `-transcript` | حفظ نسخة من محادثة التذكرة | Owner / Administrator |
| `-stats` | عرض إحصائيات التذاكر | الجميع |
 
## 5) كيف تعمل لوحة التذاكر
 
1. إداري يكتب `-ticket` → تُرسل embed "نظام التذاكر" مع قائمة اختيار (Select Menu) فيها الأقسام الخمسة:
   الدعم الفني، الشكاوى، تقديم فرع العيال، تقديم فرع البنات، الاستفسارات.
2. عند اختيار العضو لقسم، يتم إنشاء قناة خاصة باسم مثل `support-001` / `complaint-002` ...إلخ،
   مع منع فتح أكثر من تذكرة واحدة لنفس العضو (حسب `maxOpenTickets`).
3. داخل التذكرة تظهر أزرار: **استلام التذكرة**، **إغلاق التذكرة**، **إضافة عضو**، **إزالة عضو**.
4. عند الإغلاق تظهر رسالة تأكيد (تأكيد الإغلاق / إلغاء)، وبعد التأكيد:
   - تُمنع كتابة صاحب التذكرة.
   - يُحفظ Transcript (ملف HTML) ويُرسل لقناة الـ Transcript.
   - تُحذف القناة تلقائياً بعد 5 ثوانٍ.
5. كل حدث (إنشاء / استلام / إلغاء استلام / إغلاق / حذف) يُسجَّل في قناة اللوق بنفس شكل "Ticket Logs" من ملفك.
 
## 6) الأسرار و GitHub
 
المشروع مقسّم لجزئين:
- `config.json` → إعدادات ثابتة غير سرية (البادئة، الأقسام، الألوان...) — آمن رفعه لقيتهب.
- `.env` (أنشئه بنفسك من `.env.example`) → التوكن وآيدي الرولات/القنوات — **لا يُرفع أبداً**، وهو مُدرج في `.gitignore`.
 
راجع القسم التالي في الجواب للشرح الكامل خطوة بخطوة عن ربط المشروع بـ GitHub بشكل صحيح.
 
## 7) التخزين
 
البوت يستخدم ملفات JSON بسيطة (`data/tickets.json`, `data/counters.json`) بدون الحاجة لقاعدة بيانات خارجية. مناسب لسيرفر واحد أو عدة سيرفرات بحجم متوسط. إذا احتجت قاعدة بيانات حقيقية (MongoDB/SQLite) لاحقاً، بإمكاننا استبدال `utils/storage.js` بسهولة لأن باقي الكود يتعامل معه كواجهة موحدة فقط.
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'commands'
cat > 'commands/add.js' << 'NAXO_EOF_MARKER_9f3k'
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
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'commands'
cat > 'commands/claim.js' << 'NAXO_EOF_MARKER_9f3k'
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
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'commands'
cat > 'commands/close.js' << 'NAXO_EOF_MARKER_9f3k'
const storage = require('../utils/storage');
const perms = require('../utils/permissions');
const embeds = require('../utils/embeds');
const ticketManager = require('../utils/ticketManager');
 
module.exports = {
  name: 'close',
  description: 'إغلاق التذكرة الحالية.',
  async execute(message) {
    const ticket = storage.getTicketByChannel(message.channel.id);
    if (!ticket) {
      return message.reply('هذه القناة ليست تذكرة.');
    }
 
    // صاحب التذكرة لا يستطيع إغلاق التذكرة أو حذفها بنفسه
    if (!perms.canCloseOrDelete(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionCloseEmbed()] });
    }
 
    await ticketManager.promptClose(message.channel);
  },
};
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'commands'
cat > 'commands/delete.js' << 'NAXO_EOF_MARKER_9f3k'
const storage = require('../utils/storage');
const perms = require('../utils/permissions');
const embeds = require('../utils/embeds');
const ticketManager = require('../utils/ticketManager');
 
module.exports = {
  name: 'delete',
  description: 'حذف التذكرة الحالية.',
  async execute(message) {
    const ticket = storage.getTicketByChannel(message.channel.id);
    if (!ticket) {
      return message.reply('هذه القناة ليست تذكرة.');
    }
 
    if (!perms.canCloseOrDelete(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionCloseEmbed()] });
    }
 
    await message.channel.send({
      embeds: [embeds.ticketDeletedEmbed({ ticketNumber: ticket.ticketNumber })],
    });
    await ticketManager.deleteTicketChannel(message.channel, ticket);
  },
};
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'commands'
cat > 'commands/remove.js' << 'NAXO_EOF_MARKER_9f3k'
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
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'commands'
cat > 'commands/rename.js' << 'NAXO_EOF_MARKER_9f3k'
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
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'commands'
cat > 'commands/stats.js' << 'NAXO_EOF_MARKER_9f3k'
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
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'commands'
cat > 'commands/ticket.js' << 'NAXO_EOF_MARKER_9f3k'
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
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'commands'
cat > 'commands/transcript.js' << 'NAXO_EOF_MARKER_9f3k'
const storage = require('../utils/storage');
const perms = require('../utils/permissions');
const embeds = require('../utils/embeds');
const ticketManager = require('../utils/ticketManager');
const config = require('../config');
 
module.exports = {
  name: 'transcript',
  description: 'حفظ نسخة من محادثة التذكرة.',
  async execute(message) {
    if (!config.transcriptSystemEnabled) {
      return message.reply('نظام الـ Transcript غير مفعّل حالياً.');
    }
    const ticket = storage.getTicketByChannel(message.channel.id);
    if (!ticket) return message.reply('هذه القناة ليست تذكرة.');
 
    if (!perms.canRenameOrTranscript(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionAdminEmbed()] });
    }
 
    await ticketManager.saveTranscript(message.channel, ticket);
    await message.reply('تم حفظ نسخة من المحادثة وإرسالها إلى قناة السجل.');
  },
};
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'commands'
cat > 'commands/unclaim.js' << 'NAXO_EOF_MARKER_9f3k'
const storage = require('../utils/storage');
const perms = require('../utils/permissions');
const embeds = require('../utils/embeds');
const ticketManager = require('../utils/ticketManager');
 
module.exports = {
  name: 'unclaim',
  description: 'إلغاء استلام التذكرة.',
  async execute(message) {
    const ticket = storage.getTicketByChannel(message.channel.id);
    if (!ticket) return message.reply('هذه القناة ليست تذكرة.');
 
    if (!perms.canClaim(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionAdminEmbed()] });
    }
 
    if (!ticket.claimedBy) {
      return message.reply('هذه التذكرة غير مُستلمة أصلاً.');
    }
 
    // فقط من استلمها أو الإدارة العليا (Owner/Administrator) يستطيع إلغاء الاستلام
    const isClaimant = ticket.claimedBy === message.author.id;
    if (!isClaimant && !perms.canCloseOrDelete(message.member)) {
      return message.reply({ embeds: [embeds.noPermissionAdminEmbed()] });
    }
 
    storage.updateTicket(message.channel.id, { claimedBy: null });
    await message.channel.send({ embeds: [embeds.ticketUnclaimedEmbed()] });
    await ticketManager.sendLog(message.guild, {
      ticketNumber: ticket.ticketNumber,
      user: { id: ticket.ownerId },
      categoryLabel: ticket.categoryLabel,
      action: 'Ticket Unclaimed',
      staff: message.author,
    });
  },
};
NAXO_EOF_MARKER_9f3k
 
cat > 'config.js' << 'NAXO_EOF_MARKER_9f3k'
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
NAXO_EOF_MARKER_9f3k
 
cat > 'config.json' << 'NAXO_EOF_MARKER_9f3k'
{
  "prefix": "-",
  "maxOpenTickets": 1,
  "claimSystemEnabled": true,
  "transcriptSystemEnabled": true,
  "embedColor": "#2b2d31",
 
  "categories": {
    "support": {
      "label": "الدعم الفني",
      "description": "للمشاكل التقنية والمساعدة",
      "emoji": "🛠️",
      "prefix": "support"
    },
    "complaint": {
      "label": "الشكاوى",
      "description": "لتقديم شكوى أو الإبلاغ عن مشكلة",
      "emoji": "⚠️",
      "prefix": "complaint"
    },
    "apply-boys": {
      "label": "تقديم فرع العيال",
      "description": "للتقديم على فرع العيال",
      "emoji": "📋",
      "prefix": "apply-boys"
    },
    "apply-girls": {
      "label": "تقديم فرع البنات",
      "description": "للتقديم على فرع البنات",
      "emoji": "📋",
      "prefix": "apply-girls"
    },
    "question": {
      "label": "الاستفسارات",
      "description": "للاستفسارات العامة",
      "emoji": "❓",
      "prefix": "question"
    }
  }
}
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'data'
cat > 'data/.gitkeep' << 'NAXO_EOF_MARKER_9f3k'
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'events'
cat > 'events/interactionCreate.js' << 'NAXO_EOF_MARKER_9f3k'
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
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'events'
cat > 'events/messageCreate.js' << 'NAXO_EOF_MARKER_9f3k'
const config = require('../config');
 
module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(config.prefix)) return;
 
    const args = message.content.slice(config.prefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
 
    const command = client.commands.get(commandName);
    if (!command) return;
 
    try {
      await command.execute(message, args, client);
    } catch (err) {
      console.error(`Error executing command "${commandName}":`, err);
      message.reply('حدث خطأ أثناء تنفيذ الأمر.').catch(() => {});
    }
  },
};
NAXO_EOF_MARKER_9f3k
 
cat > 'index.js' << 'NAXO_EOF_MARKER_9f3k'
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const config = require('./config');
 
if (!config.token) {
  console.error(
    '❌ لم يتم العثور على DISCORD_TOKEN. أنشئ ملف .env (انسخ من .env.example) وعبّئ القيم قبل التشغيل.'
  );
  process.exit(1);
}
 
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel, Partials.Message],
});
 
// ---------- تحميل الأوامر ----------
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
for (const file of fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'))) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.name, command);
}
 
// ---------- تحميل الأحداث ----------
const eventsPath = path.join(__dirname, 'events');
for (const file of fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'))) {
  const event = require(path.join(eventsPath, file));
  client.on(event.name, (...args) => event.execute(...args, client));
}
 
client.once('ready', () => {
  console.log(`✅ NAXO TICKET BOT جاهز — مسجّل الدخول باسم ${client.user.tag}`);
  console.log(`Prefix: "${config.prefix}"`);
});
 
client.login(config.token);
NAXO_EOF_MARKER_9f3k
 
cat > 'package.json' << 'NAXO_EOF_MARKER_9f3k'
{
  "name": "naxo-ticket-bot",
  "version": "1.0.0",
  "description": "NAXO Ticket Bot - Discord ticket system (Arabic) built with discord.js v14",
  "main": "index.js",
  "type": "commonjs",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "discord.js": "^14.14.1",
    "dotenv": "^16.4.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'utils'
cat > 'utils/embeds.js' << 'NAXO_EOF_MARKER_9f3k'
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
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'utils'
cat > 'utils/permissions.js' << 'NAXO_EOF_MARKER_9f3k'
const config = require('../config');
 
/** هل العضو Owner (كل الصلاحيات) */
function isOwner(member) {
  if (!member) return false;
  if (member.guild.ownerId === member.id) return true;
  return member.roles.cache.has(config.ownerRoleId);
}
 
/** هل العضو Administrator */
function isAdministrator(member) {
  if (!member) return false;
  if (member.permissions.has('Administrator')) return true;
  return member.roles.cache.has(config.adminRoleId);
}
 
/** هل العضو Staff */
function isStaff(member) {
  if (!member) return false;
  return member.roles.cache.has(config.staffRoleId);
}
 
/** الإدارة = Owner أو Administrator أو Staff (لأوامر مثل claim/add/remove) */
function isManagement(member) {
  return isOwner(member) || isAdministrator(member) || isStaff(member);
}
 
/** من يملك صلاحية إغلاق/حذف التذكرة = Owner أو Administrator فقط (وفق الملف) */
function canCloseOrDelete(member) {
  return isOwner(member) || isAdministrator(member);
}
 
/** من يملك صلاحية استلام التذكرة = Owner, Administrator, Staff */
function canClaim(member) {
  return isOwner(member) || isAdministrator(member) || isStaff(member);
}
 
/** من يملك صلاحية إضافة/إزالة أعضاء = Owner, Administrator, Staff */
function canAddRemoveMembers(member) {
  return isOwner(member) || isAdministrator(member) || isStaff(member);
}
 
/** من يملك صلاحية تغيير الاسم / إنشاء Transcript = Owner, Administrator */
function canRenameOrTranscript(member) {
  return isOwner(member) || isAdministrator(member);
}
 
module.exports = {
  isOwner,
  isAdministrator,
  isStaff,
  isManagement,
  canCloseOrDelete,
  canClaim,
  canAddRemoveMembers,
  canRenameOrTranscript,
};
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'utils'
cat > 'utils/storage.js' << 'NAXO_EOF_MARKER_9f3k'
const fs = require('fs');
const path = require('path');
 
const DATA_DIR = path.join(__dirname, '..', 'data');
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');
const COUNTERS_FILE = path.join(DATA_DIR, 'counters.json');
 
function ensureFile(filePath, defaultData) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf8');
  }
}
 
ensureFile(TICKETS_FILE, { tickets: [] });
ensureFile(COUNTERS_FILE, { global: 0, byCategory: {} });
 
function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}
 
function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}
 
// ---------- Tickets ----------
 
function getAllTickets() {
  return readJSON(TICKETS_FILE).tickets;
}
 
function saveAllTickets(tickets) {
  writeJSON(TICKETS_FILE, { tickets });
}
 
function getTicketByChannel(channelId) {
  return getAllTickets().find((t) => t.channelId === channelId) || null;
}
 
function getOpenTicketByOwner(ownerId, guildId) {
  return (
    getAllTickets().find(
      (t) => t.ownerId === ownerId && t.guildId === guildId && t.status === 'open'
    ) || null
  );
}
 
function addTicket(ticket) {
  const tickets = getAllTickets();
  tickets.push(ticket);
  saveAllTickets(tickets);
  return ticket;
}
 
function updateTicket(channelId, updates) {
  const tickets = getAllTickets();
  const idx = tickets.findIndex((t) => t.channelId === channelId);
  if (idx === -1) return null;
  tickets[idx] = { ...tickets[idx], ...updates };
  saveAllTickets(tickets);
  return tickets[idx];
}
 
function removeTicket(channelId) {
  const tickets = getAllTickets().filter((t) => t.channelId !== channelId);
  saveAllTickets(tickets);
}
 
function getStats(guildId, userId) {
  const tickets = getAllTickets().filter((t) => t.guildId === guildId);
  const total = tickets.length;
  const open = tickets.filter((t) => t.status === 'open').length;
  const closed = tickets.filter((t) => t.status === 'closed').length;
  const userTickets = tickets.filter((t) => t.ownerId === userId).length;
  return { total, open, closed, userTickets };
}
 
// ---------- Counters ----------
 
function nextNumber(categoryKey) {
  const counters = readJSON(COUNTERS_FILE);
  counters.global = (counters.global || 0) + 1;
  counters.byCategory[categoryKey] = (counters.byCategory[categoryKey] || 0) + 1;
  writeJSON(COUNTERS_FILE, counters);
  return {
    global: counters.global,
    category: counters.byCategory[categoryKey],
  };
}
 
module.exports = {
  getAllTickets,
  getTicketByChannel,
  getOpenTicketByOwner,
  addTicket,
  updateTicket,
  removeTicket,
  getStats,
  nextNumber,
};
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'utils'
cat > 'utils/ticketManager.js' << 'NAXO_EOF_MARKER_9f3k'
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
NAXO_EOF_MARKER_9f3k
 
mkdir -p 'utils'
cat > 'utils/transcript.js' << 'NAXO_EOF_MARKER_9f3k'
const { AttachmentBuilder } = require('discord.js');
 
function escapeHtml(str = '') {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
 
/**
 * يجلب كل رسائل قناة التذكرة ويبني ملف HTML يمثل الـ Transcript
 */
async function generateTranscript(channel, ticket) {
  let allMessages = [];
  let lastId;
 
  // Discord limits fetch to 100 per call, so we page backwards until exhausted
  while (true) {
    const options = { limit: 100 };
    if (lastId) options.before = lastId;
    const batch = await channel.messages.fetch(options);
    if (batch.size === 0) break;
    allMessages.push(...batch.values());
    lastId = batch.last().id;
    if (batch.size < 100) break;
  }
 
  allMessages.reverse(); // من الأقدم إلى الأحدث
 
  const rows = allMessages
    .map((m) => {
      const time = new Date(m.createdTimestamp).toLocaleString('en-GB');
      const author = escapeHtml(m.author?.tag || 'Unknown');
      const content = escapeHtml(m.content || '');
      const attachments = [...m.attachments.values()]
        .map((a) => `<div class="attachment"><a href="${a.url}" target="_blank">${escapeHtml(a.name)}</a></div>`)
        .join('');
      return `
        <div class="message">
          <div class="meta"><span class="author">${author}</span> <span class="time">${time}</span></div>
          <div class="content">${content}</div>
          ${attachments}
        </div>`;
    })
    .join('\n');
 
  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>NAXO Ticket Transcript - #${String(ticket.ticketNumber).padStart(3, '0')}</title>
<style>
  body { background:#313338; color:#dbdee1; font-family: Arial, sans-serif; padding:20px; }
  h1 { color:#fff; }
  .info { background:#2b2d31; padding:12px 16px; border-radius:8px; margin-bottom:20px; }
  .info div { margin:4px 0; }
  .message { border-bottom:1px solid #3f4147; padding:10px 0; }
  .meta { font-size:12px; color:#949ba4; }
  .author { font-weight:bold; color:#fff; margin-left:8px; }
  .content { margin-top:4px; white-space:pre-wrap; word-wrap:break-word; }
  .attachment { margin-top:4px; }
  .attachment a { color:#00a8fc; }
</style>
</head>
<body>
  <h1>NAXO TICKET TRANSCRIPT</h1>
  <div class="info">
    <div><b>Ticket:</b> #${String(ticket.ticketNumber).padStart(3, '0')}</div>
    <div><b>Owner:</b> ${escapeHtml(ticket.ownerTag)}</div>
    <div><b>Category:</b> ${escapeHtml(ticket.categoryLabel)}</div>
    <div><b>Created:</b> ${new Date(ticket.createdAt).toLocaleString('en-GB')}</div>
    <div><b>Closed:</b> ${new Date().toLocaleString('en-GB')}</div>
    <div><b>Closed By:</b> ${escapeHtml(ticket.closedByTag || '—')}</div>
  </div>
  ${rows || '<p>لا توجد رسائل.</p>'}
</body>
</html>`;
 
  const buffer = Buffer.from(html, 'utf8');
  return new AttachmentBuilder(buffer, {
    name: `transcript-${String(ticket.ticketNumber).padStart(3, '0')}.html`,
  });
}
 
module.exports = { generateTranscript };
NAXO_EOF_MARKER_9f3k
 
echo "==> تم إنشاء جميع الملفات بنجاح داخل مجلد naxo-ticket-bot"
echo "الخطوة التالية:"
echo "  cd naxo-ticket-bot"
echo "  cp .env.example .env   # ثم عبّي القيم الحقيقية بداخله"
echo "  npm install"
echo "  npm start"
