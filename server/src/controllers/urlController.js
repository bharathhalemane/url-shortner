const { baseUrl } = require("../config/env");
const validateUrl = require("../utils/validateUrl");
const validateAlias = require("../utils/validateAlias");
const AppError = require("../utils/AppError");
const urlService = require('../services/urlService')

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
        
        const doc = await urlService.findByCode(code);        
        if (!doc) return res.status(404).json({ error: "Short link not found." })
        if(doc.expiresAt && doc.expiresAt < new Date()) return res.status(410).json({error: "Short link expired."})
        res.redirect(302, doc.longUrl)
    } catch (err) {
        next(err)
    }
}
module.exports = { create, redirect }