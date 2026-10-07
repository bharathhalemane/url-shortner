require('dotenv').config();
const crypto = require('crypto');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Click = require('../src/models/Click');

const dns = require("dns")

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const [code, countArg] = process.argv.slice(2);
if (!code) {
  console.error('Usage: node scripts/seedClicks.js <shortCode> [count=100000]');
  process.exit(1);
}
const COUNT = parseInt(countArg, 10) || 100000;
const CHUNK = 10000;

const COUNTRIES = [['IN', 50], ['US', 20], ['GB', 8], ['DE', 6], ['BR', 5], ['JP', 4], ['CA', 4], ['XX', 3]];
const DEVICES = [['mobile', 60], ['desktop', 35], ['tablet', 5]];
const REFERRERS = [['direct', 40], ['twitter.com', 20], ['linkedin.com', 15], ['google.com', 15], ['reddit.com', 5], ['news.ycombinator.com', 5]];
const BROWSERS = [['Chrome', 60], ['Safari', 20], ['Firefox', 10], ['Edge', 10]];
const OSES = [['Android', 40], ['iOS', 25], ['Windows', 25], ['macOS', 10]];

function pick(table) {
  const total = table.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of table) if ((r -= w) < 0) return v;
  return table[0][0];
}

(async () => {
  await connectDB();
  const now = Date.now();
  const thirtyDays = 30 * 24 * 3600 * 1000;

  for (let done = 0; done < COUNT; done += CHUNK) {
    const n = Math.min(CHUNK, COUNT - done);
    const docs = Array.from({ length: n }, () => ({
      eventId: `seed-${crypto.randomUUID()}`,
      shortCode: code,
      // power > 1 skews timestamps toward "now", like a link gaining traction
      ts: new Date(now - Math.pow(Math.random(), 1.5) * thirtyDays),
      country: pick(COUNTRIES),
      device: pick(DEVICES),
      browser: pick(BROWSERS),
      os: pick(OSES),
      referrer: pick(REFERRERS),
    }));
    await Click.collection.insertMany(docs, { ordered: false }); // driver direct = fastest
    console.log(`inserted ${done + n}/${COUNT}`);
  }
  await mongoose.disconnect();
})();