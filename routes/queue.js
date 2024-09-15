const express = require('express');
const { postMessage, getMessage } = require('../controllers/queueController');

const router = express.Router();

// POST to add a message to a queue
router.post('/:queue_name', postMessage);

// GET to retrieve the next message from a queue
router.get('/:queue_name', getMessage);

module.exports = router;
