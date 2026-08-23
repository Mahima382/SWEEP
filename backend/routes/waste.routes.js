/**
 * Waste routes (FR-03, FR-05). Mounted at /api/waste.
 */

const express = require('express');
const wasteController = require('../controllers/wasteController');

const router = express.Router();

router.get('/listings', wasteController.getListings);
router.get('/pickups', wasteController.getPickups);

module.exports = router;
