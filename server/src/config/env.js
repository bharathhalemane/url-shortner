require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  queueRedisUrl: process.env.QUEUE_REDIS_URL || 'redis://127.0.0.1:6380',
  cacheEnabled: process.env.CACHE_ENABLED !== 'false',
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS, 10) || 3600,
  clickBatchSize: parseInt(process.env.CLICK_BATCH_SIZE, 10) || 500,
  clickFlushMs: parseInt(process.env.CLICK_FLUSH_MS, 10) || 1000,
  trustProxy: process.env.TRUST_PROXY === 'true',
}