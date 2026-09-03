/**
 * Wallet routes (FR-04, FR-06). Mounted at /api/wallet.
 */

const express = require('express');
const walletController = require('../controllers/walletController');

const router = express.Router();

router.get('/', walletController.getWallet);
router.post('/withdraw', walletController.withdrawFunds);
router.get('/export/csv', walletController.exportCsv);
router.get('/export/pdf', walletController.exportPdf);

module.exports = router;
