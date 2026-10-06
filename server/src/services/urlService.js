const AppError = require('../utils/AppError');
const Url = require('../models/Url');
const {generateCode} = require('./idService');

const MAX_RETRIES = 5;


const createShortURL = async ({ longUrl, alias } ) => {
    if(alias) {
        try{
            return await Url.create({
                shortCode: alias, longUrl, isCustom: true
            });
        }catch(err) {
            if (err.code === 11000) throw new AppError(409, 'Alias already taken');
            throw err;
        }
    }

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++){
        try{
            return await Url.create({ shortCode: await generateCode(), longUrl });
        }catch(err){
            if ( err.code === 11000) continue;
            throw err;
        }
    }
    throw new AppError(500, 'Could not generate a unique short code')
}

const findByCode = async (shortCode) => {
    return await Url.findOne({ shortCode }).lean();
}

module.exports = { createShortURL, findByCode };