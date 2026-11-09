
const kycController = require("../controllers/kycController"); // import controllers

const express = require("express");
const router = express.Router();

// retrieve all pending KYC submissions
router.get("/kyc/pending", kycController.getPendingKycSubmissions);

// retrieve details of a specific KYC submission
router.get("/kyc/:id", kycController.getKycSubmissionDetails);

// approve a KYC submission
router.patch("/kyc/:id/approve", kycController.approveKycSubmission);

// reject a KYC submission
router.patch("/kyc/:id/reject", kycController.rejectKycSubmission);

module.exports = router; // export to server.js
