const redis = require('../config/redis');

// Atomic: read both windows, decide, then increment, all in one step.
// KEYS[1] = current window counter, KEYS[2] = previous window counter
// ARGV    = window ms, limit, ms elapsed in the current window
const SLIDING_WINDOW = `
local window = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local elapsed = tonumber(ARGV[3])
local curr = tonumber(redis.call('GET', KEYS[1]) or '0')
local prev = tonumber(redis.call('GET', KEYS[2]) or '0')
local est = prev * ((window - elapsed) / window) + curr
if est + 1 > limit then
  return {0, math.floor(est)}
end
redis.call('INCR', KEYS[1])
redis.call('PEXPIRE', KEYS[1], window * 2)
return {1, math.floor(est) + 1}
`;

redis.defineCommand('slidingWindow', { numberOfKeys: 2, lua: SLIDING_WINDOW });

function rateLimit({ name, windowMs, limit, keyFn = (req) => req.ip }) {
  return async function rateLimitMiddleware(req, res, next) {
    try {
      const now = Date.now();
      const id = Math.floor(now / windowMs);
      const elapsed = now % windowMs;
      const base = `rl:${name}:${keyFn(req)}`;

      const [allowed, used] = await redis.slidingWindow(
        `${base}:${id}`,
        `${base}:${id - 1}`,
        windowMs,
        limit,
        elapsed
      );

      res.set({
        'RateLimit-Limit': limit,
        'RateLimit-Remaining': Math.max(0, limit - used),
      });

      if (!allowed) {
        const retryAfter = Math.ceil((windowMs - elapsed) / 1000); // approximate upper bound
        res.set('Retry-After', retryAfter);
        return res.status(429).json({ error: `Too many requests. Try again in ${retryAfter}s.` });
      }
      next();
    } catch (err) {
      // Fail open: a Redis outage must not block all link creation
      console.error('[ratelimit] Redis unavailable, allowing request:', err.message);
      next();
    }
  };
}

module.exports = rateLimit;