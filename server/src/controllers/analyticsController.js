const AppError = require("../utils/AppError")
const urlService = require('../services/urlService')
const { getLinkAnalytics, UNIT_MS} = require('../services/analyticsService')

const CODE_REGEX = /^[A-Za-x0-9_-]{1,30}$/;
const MAX_RANGE_DAYS = 366
const MAX_BUCKETS = 1000

const parseQuery = (q) => {
    const now = new Date();
    now.setSeconds(0,0)

    const to = q.to? new Date(q.to) : now;
    const from = q.from ? new Date(q.from) : new Date(to.getTime() - 7 * UNIT_MS.day)
    const interval = q. interval || 'day'

     if (isNaN(from) || isNaN(to)) throw new AppError(400, 'from/to must be valid ISO dates');
  if (from >= to) throw new AppError(400, '"from" must be before "to"');
  if (!UNIT_MS[interval]) throw new AppError(400, 'interval must be "hour" or "day"');
  if (to - from > MAX_RANGE_DAYS * UNIT_MS.day) {
    throw new AppError(400, `Range too large (max ${MAX_RANGE_DAYS} days)`);
  }
  if ((to - from) / UNIT_MS[interval] > MAX_BUCKETS) {
    throw new AppError(400, 'Too many buckets: use interval=day or a smaller range');
  }
  return { from, to, interval, includeBots: q.includeBots === 'true' };
}

async function getAnalytics(req, res, next) {
  try {
    const { code } = req.params;
    if (!CODE_REGEX.test(code)) throw new AppError(404, 'Short link not found');

    const opts = parseQuery(req.query);

    // Reuses the Redis-cached lookup from Step 3: no extra DB hit for existence
    const { record } = await urlService.resolve(code);
    if (!record) throw new AppError(404, 'Short link not found');

    res.json(await getLinkAnalytics(code, opts));
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics }