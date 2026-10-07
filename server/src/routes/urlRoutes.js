const router = require('express').Router();
const { create, redirect } = require('../controllers/urlController');
const {getAnalytics} = require("../controllers/analyticsController")

router.post('/api/urls', create);
router.get('/api/urls/:code/analytics',getAnalytics)
router.get('/:code', redirect);

module.exports = router;