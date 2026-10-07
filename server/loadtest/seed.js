require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Url = require('../src/models/Url');
const Click = require('../src/models/Click');
const { generateCode } = require('../src/services/idService');
const dns = require("dns")

dns.setServers(["8.8.8.8", "8.8.4.4"]);
const CODES_FILE = path.join(__dirname, 'codes.json');

(async () => {
  await connectDB();

  if (process.argv[2] === '--clean') {
    const codes = fs.existsSync(CODES_FILE) ? JSON.parse(fs.readFileSync(CODES_FILE, 'utf8')) : [];
    const links = await Url.deleteMany({ longUrl: { $regex: '^https://example\\.com/lt/' } });
    const clicks = await Click.deleteMany({ shortCode: { $in: codes } });
    if (fs.existsSync(CODES_FILE)) fs.unlinkSync(CODES_FILE);
    console.log(`Removed ${links.deletedCount} links and ${clicks.deletedCount} clicks`);
  } else {
    const n = Number(process.argv[2]) || 10000;
    const docs = [];
    for (let i = 0; i < n; i++) {
      docs.push({ shortCode: await generateCode(), longUrl: `https://example.com/lt/${i}` });
    }
    await Url.insertMany(docs, { ordered: false });
    fs.writeFileSync(CODES_FILE, JSON.stringify(docs.map((d) => d.shortCode)));
    console.log(`Seeded ${n} links -> loadtest/codes.json (index 0 = most popular)`);
  }

  await mongoose.disconnect();
})();