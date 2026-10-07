const QRCode = require('qrcode');
const AppError = require('../utils/AppError');
const urlService = require('../services/urlService');
const { baseUrl } = require('../config/env');

const CODE_REGEX = /^[A-Za-z0-9_-]{1,30}$/;
const OPTS = { errorCorrectionLevel: 'M', margin: 2, color: { dark: '#0f172a', light: '#ffffff' } };

// GET /api/urls/:code/qr?format=svg|png[&download=1]
async function getQr(req, res, next) {
  try {
    const { code } = req.params;
    if (!CODE_REGEX.test(code)) throw new AppError(404, 'Short link not found');

    const { record } = await urlService.resolve(code); // cached lookup, no extra DB hit
    if (!record) throw new AppError(404, 'Short link not found');
    if (record.expiresAt && new Date(record.expiresAt) < new Date()) throw new AppError(410, 'Link expired');

    const target = `${baseUrl}/${code}`; // the SHORT url, so scans still count as clicks
    res.set('Cache-Control', 'public, max-age=86400'); // the short URL never changes

    if (req.query.format === 'png') {
      const buf = await QRCode.toBuffer(target, { ...OPTS, type: 'png', width: 512 });
      if (req.query.download === '1') {
        res.set('Content-Disposition', `attachment; filename="${code}-qr.png"`);
      }
      return res.type('png').send(buf);
    }

    const svg = await QRCode.toString(target, { ...OPTS, type: 'svg' });
    res.type('image/svg+xml').send(svg);
  } catch (err) {
    next(err);
  }
}

module.exports = { getQr };