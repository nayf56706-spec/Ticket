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
