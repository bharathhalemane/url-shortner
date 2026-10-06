require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    mongoURI: process.env.MONGO_URI,
    baseUrl: process.env.BASE_URL,
    redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
    cacheEnabled: process.env.CACHE_ENABLED !== 'false',
    cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS, 10) || 3600
}