const express = require('express');
const router = express.Router();
const taskController = require('../controller/Dirwatcher');

router.post('/start', taskController.startTask);

router.post('/stop', taskController.stopTask);

router.get('/', taskController.getTaskResults);

router.get('/all', taskController.getAllTaskResults);

module.exports = router;
