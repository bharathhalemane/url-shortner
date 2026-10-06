const crypto = require("crypto");
const Url = require('../models/Url');

const ALPHABET =  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const SHORT_CODE_LENGTH = 7;
const MAX_RETRIES = 5;

const randomCode = () => {
    const bytes = crypto.randomBytes(SHORT_CODE_LENGTH);
    let out = '';
    for (let i = 0; i < SHORT_CODE_LENGTH; i++) {
        out += ALPHABET[bytes[i] % ALPHABET.length];    
    }
    return out;
}

const createShortURL = async (longUrl) => {
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try{
            return await Url.create({
                shortCode: randomCode(),
                longUrl: longUrl
            });
        }catch(err){
            if (err.code === 11000) continue;
            throw err;
        }
    }
    throw new Error("Could not generate a unique short URL")
}

const findByCode = async (shortCode) => {
    return await Url.findOne({ shortCode });
}

module.exports = { createShortURL, findByCode };