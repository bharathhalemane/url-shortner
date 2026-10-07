const { baseUrl } = require("../config/env");
const validateUrl = require("../utils/validateUrl");
const validateAlias = require("../utils/validateAlias");
const AppError = require("../utils/AppError");
const urlService = require('../services/urlService')
const crypto = require('crypto')
const {enqueueClick} = require('../queues/clickQueue')

const CODE_REGEX = /^[A-Za-z0-9_-]{1,30}$/;

const create = async (req, res, next) => {
    try{
        const {longUrl, alias} = req.body;

        const clean = validateUrl(longUrl);
        if(!clean) throw new AppError(400, "Invalid URL. Use http(s), max 2048 chars.")

        const cleanAlias = alias ? validateAlias(alias) : undefined;
        
        const doc = await urlService.createShortURL({ longUrl: clean, alias: cleanAlias })
        
        res.status(201).json({
            shortCode: doc.shortCode,
            shortUrl: `${baseUrl}/${doc.shortCode}`,
            longUrl: doc.longUrl,
            isCustom: doc.isCustom
        })
    }catch(err){
        next(err);
    }
}

const redirect = async (req, res, next) => {
    try {
        const {code} = req.params;
        if (!CODE_REGEX.test(code)) return res.status(404).json({ error: "Short link not found" })
        
        const { record, source } = await urlService.resolve(code);
        
        res.set('X-Cache', source === 'cache' ? 'HIT' : 'MISS');

        if(!record) return res.status(404).json({error: 'Short link not found'});
        if(record.expiresAt && new Date(record.expiresAt) < new Date()) {
            return res.status(410).json({ error: "Link expired" });
        }

        if (req.method === 'GET') {
            enqueueClick({
                eventId: crypto.randomUUID(),
                shortCode: code,
                ts: Date.now(),
                ip: req.ip,
                ua: req.get('user-agent') || '',
                ref: req.get('referer') || '',
            })
        }

        res.redirect(302, record.longUrl)
    } catch (err) {
        next(err)
    }
}
module.exports = { create, redirect }