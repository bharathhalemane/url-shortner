const AppError = require('./AppError');

const MIN_SECONDS = 60;
const MAX_SECONDS = 365 * 24 * 3600;

// expiresIn: seconds from now (optional). Returns a Date or null (never expires).
function parseExpiry(expiresIn) {
  if (expiresIn === undefined || expiresIn === null || expiresIn === '') return null;
  const secs = Number(expiresIn);
  if (!Number.isInteger(secs) || secs < MIN_SECONDS || secs > MAX_SECONDS) {
    throw new AppError(400, `expiresIn must be a whole number of seconds between ${MIN_SECONDS} and ${MAX_SECONDS}`);
  }
  return new Date(Date.now() + secs * 1000);
}

module.exports = parseExpiry;