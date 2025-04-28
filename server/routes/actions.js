// /server/routes/actions.js

const express = require('express');
const router = express.Router();
const actionsController = require('../controllers/actionsController');

// Next actions route - returns personalized next actions for the user
router.get('/', actionsController.getNextActions);

module.exports = router;