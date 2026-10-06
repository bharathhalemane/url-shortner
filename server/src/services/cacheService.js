const redis = require('../config/redis');
const { cacheEnabled, cacheTtlSeconds } = require('../config/env');

const key = (code) => `url:${code}`;
const NOT_FOUND = '__nf__';
const NEGATIVE_TTL = 60;

const ttlWithJitter = (base) => {
    const jitter = base * 0.1;
    return Math.max(1, Math.floor(base - jitter + Math.random() * 2 * jitter));
}

const get = async (code) => {    
    if (!cacheEnabled) return undefined;
    try{
        const v = await redis.get(key(code));        
        if (v === null) return undefined;
        if (v === NOT_FOUND) return null;
        return JSON.parse(v);
    }catch{
        return undefined;
    }
}

const set = async (code, record) => {
    if (!cacheEnabled) return;
    try{
        let ttl = ttlWithJitter(cacheTtlSeconds);
        if(record.expiresAt) {
            const secsLeft = Math.floor((new Date(record.expiresAt) - Date.now() / 1000));
            if(secsLeft <= 0) return;
            ttl = Math.min(ttl, secsLeft);
        }
        const value = JSON.stringify({longUrl: record.longUrl, expiresAt: record.expiresAt || null});
        await redis.set(key(code), value, 'EX', ttl);
    }catch{
        return undefined;
    }
}

const setNotFound = async (code) => {
    if (!cacheEnabled) return;
    try{
        await redis.set(key(code), NOT_FOUND, 'EX', NEGATIVE_TTL);
    }catch{
        return undefined;
    }
}

const del = async (code) => {
    if(!cacheEnabled) return;
    try{
        await redis.del(key(code));
    } catch {
        return undefined;
    }
}

module.exports = { get, set, setNotFound, del };