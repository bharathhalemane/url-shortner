const router = require('express').Router();
const { create, redirect } = require('../controllers/urlController');

router.post('/api/urls', create);
router.get('/:code', redirect);

module.exports = router;