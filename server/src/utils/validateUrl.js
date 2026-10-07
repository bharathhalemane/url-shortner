const AppError = require('./AppError');
const { baseUrl, blockedDomains } = require('../config/env');

const MAX_LENGTH = 2048;
const SELF_HOST = new URL(baseUrl).hostname.toLowerCase();

// Other shorteners hide the real destination (redirect chains)
const DEFAULT_BLOCKED = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly', 'rebrand.ly', 'cutt.ly'];
const BLOCKED = new Set([...DEFAULT_BLOCKED, ...blockedDomains]);

const matchesDomain = (host, domain) => host === domain || host.endsWith('.' + domain);

// Returns the normalized URL string, or throws AppError(400) with a specific reason
function validateUrl(input) {
  if (typeof input !== 'string' || input.trim() === '') throw new AppError(400, 'longUrl is required');
  if (input.length > MAX_LENGTH) throw new AppError(400, `URL is too long (max ${MAX_LENGTH} characters)`);

  let u;
  try {
    u = new URL(input.trim());
  } catch {
    throw new AppError(400, 'That does not look like a valid URL');
  }

  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new AppError(400, 'Only http and https URLs are allowed');
  }
  if (u.username || u.password) {
    throw new AppError(400, 'URLs with embedded credentials are not allowed');
  }

  const host = u.hostname.toLowerCase().replace(/\.$/, '');
  if (host.startsWith('[') || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    throw new AppError(400, 'Links to IP addresses are not allowed');
  }
  if (!host.includes('.') || /\.(local|localhost|internal|lan|home|corp)$/.test(host)) {
    throw new AppError(400, 'Host must be a public domain name');
  }
  if (matchesDomain(host, SELF_HOST)) {
    throw new AppError(400, 'Links to this service cannot be shortened');
  }
  for (const d of BLOCKED) {
    if (matchesDomain(host, d)) throw new AppError(400, 'This domain is not allowed');
  }

  return u.toString();
}

module.exports = validateUrl;