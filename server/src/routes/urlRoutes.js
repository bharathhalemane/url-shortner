const router = require('express').Router();
const { create, redirect } = require('../controllers/urlController');
const {getAnalytics} = require("../controllers/analyticsController")
const { createBurstLimit, createDailyLimit, readLimitPerMin } = require('../config/env')
const rateLimit = require("../middleware/rateLimit")
const { getQr } = require("../controllers/qrController")

const createBurst = rateLimit({ name: 'create-min', windowMs: 60_000, limit: createBurstLimit });
const createDaily = rateLimit({ name: 'create-day', windowMs: 86_400_000, limit: createDailyLimit });
const readLimit = rateLimit({ name: 'read', windowMs: 60_000, limit: readLimitPerMin });


router.post('/api/urls',createBurst, createDaily, create);
router.get('/api/urls/:code/analytics',readLimit, getAnalytics)
router.get('/api/urls/:code/qr', readLimit, getQr)
router.get('/:code', redirect);

module.exports = router;