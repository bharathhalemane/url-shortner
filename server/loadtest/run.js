const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE || 'http://127.0.0.1:5000'; // 127.0.0.1 avoids IPv6 lookup quirks on Windows
const LABEL = process.env.LABEL || 'run';
const DURATION = Number(process.env.DURATION || 30);
const CONNECTIONS = Number(process.env.CONNECTIONS || 100);
const ZIPF_S = Number(process.env.ZIPF_S || 1.0);
const RATE = process.env.RATE ? Number(process.env.RATE) : undefined; // fixed req/s (open-loop-ish)

const codes = JSON.parse(fs.readFileSync(path.join(__dirname, 'codes.json'), 'utf8'));

// Zipf: P(rank i) ∝ 1 / i^s, so a few links get most of the traffic
const cdf = [];
let sum = 0;
for (let i = 1; i <= codes.length; i++) {
  sum += 1 / Math.pow(i, ZIPF_S);
  cdf.push(sum);
}
function pickCode() {
  const r = Math.random() * sum;
  let lo = 0;
  let hi = cdf.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cdf[mid] < r) lo = mid + 1;
    else hi = mid;
  }
  return codes[lo];
}

let hits = 0;
let misses = 0;

function run(extra) {
  return new Promise((resolve, reject) => {
    autocannon(
      {
        url: BASE,
        connections: CONNECTIONS,
        requests: [
          {
            method: 'GET',
            headers: {
              'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0 Safari/537.36',
              referer: 'https://twitter.com/',
            },
            setupRequest: (req) => {
              req.path = `/${pickCode()}`;
              return req;
            },
            onResponse: (status, body, ctx, headers) => {
              const xc = headers && headers['x-cache'];
              if (xc === 'HIT') hits++;
              else if (xc === 'MISS') misses++;
            },
          },
        ],
        ...extra,
      },
      (err, result) => (err ? reject(err) : resolve(result))
    );
  });
}

const count302 = (r) => Number((r.statusCodeStats && r.statusCodeStats['302'] && r.statusCodeStats['302'].count) || 0);

(async () => {
  const startedAt = new Date().toISOString();
  console.log(`[${LABEL}] warm-up 5s...`);
  const warm = await run({ duration: 5 });
  hits = 0;
  misses = 0;

  console.log(`[${LABEL}] measuring ${DURATION}s, ${CONNECTIONS} connections${RATE ? `, target ${RATE} req/s` : ''}...`);
  const r = await run({ duration: DURATION, ...(RATE && { overallRate: RATE }) });

  const statusCodes = r.statusCodeStats || {};
  const only302 = Object.keys(statusCodes).every((k) => k === '302');
  const valid = only302 && !r.errors && !r.timeouts;
  const lookups = hits + misses;

  const summary = {
    label: LABEL,
    startedAt,
    valid,
    connections: CONNECTIONS,
    durationSec: DURATION,
    targetRate: RATE || null,
    zipfS: ZIPF_S,
    links: codes.length,
    reqPerSec: Math.round(r.requests.average),
    latencyMs: { p50: r.latency.p50, p90: r.latency.p90, p99: r.latency.p99, max: r.latency.max },
    cacheHitRatio: lookups ? +(hits / lookups).toFixed(3) : null,
    statusCodes,
    errors: r.errors,
    timeouts: r.timeouts,
    expectedClicks: count302(warm) + count302(r), // warm-up + measured: compare with rows in `clicks`
  };

  fs.mkdirSync(path.join(__dirname, 'results'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'results', `${LABEL}.json`), JSON.stringify(summary, null, 2));

  console.log(JSON.stringify(summary, null, 2));
  if (!valid) console.log('\n!!! INVALID RUN: non-302 responses, errors or timeouts. Do not use these numbers.');
  console.log(`\n| ${LABEL} | ${summary.reqPerSec} | ${summary.latencyMs.p50} | ${summary.latencyMs.p99} | hit ${summary.cacheHitRatio ?? 'n/a'} |`);
})();