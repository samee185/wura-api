const express = require('express');
const { addSubscriber, confirmSubscriber } = require('../controllers/subscriber');

const router = express.Router();

router.post('/', addSubscriber);
router.get('/confirm', confirmSubscriber);

module.exports = router;
