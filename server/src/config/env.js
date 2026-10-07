require('dotenv').config();

const int = (v, d) => parseInt(v, 10) || d;

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  queueRedisUrl: process.env.QUEUE_REDIS_URL || 'redis://127.0.0.1:6380',
  cacheEnabled: process.env.CACHE_ENABLED !== 'false',
  cacheTtlSeconds: int(process.env.CACHE_TTL_SECONDS, 3600),
  clickBatchSize: int(process.env.CLICK_BATCH_SIZE, 500),
  clickFlushMs: int(process.env.CLICK_FLUSH_MS, 1000),
  trustProxy: process.env.TRUST_PROXY === 'true',
  createBurstLimit: int(process.env.RL_CREATE_PER_MIN, 10),
  createDailyLimit: int(process.env.RL_CREATE_PER_DAY, 100),
  readLimitPerMin: int(process.env.RL_READ_PER_MIN, 120),
  blockedDomains: (process.env.BLOCKED_DOMAINS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean),
};