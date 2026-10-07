const Click = require("../models/Click")
const cache = require("./cacheService") 

const UNIT_MS =  { hour: 3600 * 1000, day : 24 * 3600 * 1000}
const CACHE_TTL_SECONDS = 30
const TOP_N = 10;

const truncate = (date, unit) => {
    const d = new Date(date)
    if(unit === "day") d.setUTCHours(0,0,0,0)
        else d.setUTCMinutes(0,0,0);
    return d;
}

const fillSeries = (rows, from, to, unit) => {
    const byTime = new Map(rows.map((r) => [r._id.getTime(), r.clicks]))
    const out = [];
    for (let t = truncate(from, unit).getTime(); t < to.getTime(); t+= UNIT_MS[unit]){
        out.push({t: new Date(t).toISOString(), clicks: byTime.get(t) || 0})
    }
    return out;
}

const topN = (field) => [
    {$group: {_id: field, clicks: {$sum: 1}}},
    {$sort: {clicks: -1}},
    {$limit: TOP_N}
]

const toList = (rows) => rows.map((r) => ({key: r._id, clicks: r.clicks}))

const getLinkAnalytics = async(shortCode, {from, to, interval, includeBots}) => {
    const cacheKey = `an:${shortCode}:${from.getTime()}:${to.getTime()}:${interval}:${includeBots ? 1 : 0}`;
    const cached = await cache.getJSON(cacheKey);
    if (cached) return cached;

    const match = { shortCode, ts: {$gte: from, $lt: to}}
    if(!includeBots) match.device = {$ne: 'bot'}

    const [res] = await Click.aggregate([
        { $match: match},
        {
            $facet: {
                total: [{$count: 'n'}],
                timeseries: [
                    { $group: { _id: { $dateTrunc: { date: '$ts', unit: interval } }, click: { $sum: 1 } } },
                    {$sort: {_id: 1}},
                ],
                countries: topN('$country'),
                devices: topN('$device'),
                referrers: topN('$referrer'),
                browsers: topN('$browser'),
            }
        }
    ]);

    const result = {
        shortCode,
        range: {from: from.toISOString(), to: to.toISOString(), interval},
        totalClicks: res.total[0]?.n || 0,
        timeseries: fillSeries(res.timeseries, from, to, interval),
        countries: toList(res.countries),
        devices: toList(res.devices),
        referrers: toList(res.referrers),
        browsers: toList(res.browsers),
    }

    await cache.setJSON(cacheKey, result, CACHE_TTL_SECONDS)
    return result;
}

module.exports = {getLinkAnalytics, UNIT_MS}