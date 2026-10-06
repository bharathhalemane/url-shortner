const { baseUrl } = require("../config/env");
const validateUrl = require("../utils/validateUrl");
const urlService = require('../services/urlService')

const create = async (req, res, next) => {
    try{
        const clean = validateUrl(req.body.longUrl)
        if(!clean) return res.status(400).json({error: "Invalid URL. use http(s), max 2048 chars."})

        const doc = await urlService.createShortURL(clean);
        res.status(201).json({
            shortCode: doc.shortCode,
            shortUrl: `${baseUrl}/${doc.shortCode}`,
            longUrl: doc.longUrl,
        })
    }catch(err){
        next(err)
    }
}

const redirect = async (req, res, next) => {
    try {
        const doc = await urlService.findByCode(req.params.code);
        if (!doc) return res.status(404).json({ error: "Short URL not found." })
        if(doc.expiresAt && doc.expiresAt < new Date()) return res.status(410).json({error: "Short URL has expired."})
        res.redirect(302, doc.longUrl)
    } catch (err) {
        next(err)
    }
}
module.exports = { create, redirect }