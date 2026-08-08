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
