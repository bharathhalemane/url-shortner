const AppError = require('../utils/AppError');
const Url = require('../models/Url');
const { generateCode } = require('./idService');
const cache = require('./cacheService');

const MAX_RETRIES = 5;


const createShortURL = async ({ longUrl, alias }) => {
    let doc;

    if (alias) {
        try {
            doc = await Url.create({
                shortCode: alias, longUrl, isCustom: true
            });
        } catch (err) {
            if (err.code === 11000) throw new AppError(409, 'Alias already taken');
            throw err;
        }
    } else {
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                doc = await Url.create({ shortCode: await generateCode(), longUrl });
            } catch (err) {
                if (err.code === 11000) continue;
                throw err;
            }
        }
        if(!doc) throw new AppError(500, 'Could not generate a unique short code')
    }

    await cache.set(doc.shortCode, doc);
    return doc;
}

const inflight = new Map();

const loadFromDb = async (shortCode) => {
    const doc = await Url.findOne({ shortCode }, { longUrl: 1, expiresAt: 1, _id: 0 }).lean();
    if (doc) await cache.set(shortCode, doc);
    else await cache.setNotFound(shortCode);
    return doc;
}

const resolve = async (shortCode) => {
    const cached = await cache.get(shortCode);
    if (cached !== undefined) return { record: cached, source: 'cache' };

    let p = inflight.get(shortCode);
    if(!p) {
        p = loadFromDb(shortCode).finally(() => inflight.delete(shortCode));
        inflight.set(shortCode, p);
    }
    return { record: await p, source: 'db' };
}

module.exports = { createShortURL, resolve };