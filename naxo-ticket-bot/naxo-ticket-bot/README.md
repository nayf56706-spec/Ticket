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
