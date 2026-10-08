const Redis = require("ioredis");
const { redisUrl } = require('./env');

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    commandTimeout: 5000,
});

redis.on('error', (err) => console.error('[redis]', err.message)); 

module.exports = redis;