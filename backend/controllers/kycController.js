
const kycModel = require("../models/kycModel"); // import KYC model functions


/**
 * Retrieves all pending KYC submissions.
 *
 * @param {object} req
 * @param {object} res
 *
 * @returns {Promise<void>}
 */
async function getPendingKycSubmissions(req, res) {
  try {
    const submissions = await kycModel.getPendingKycSubmissions();

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}


/**
 * Retrieves details of a specific KYC submission.
 *
 * @param {object} req
 * @param {object} res
 *
 * @returns {Promise<void>}
 */
async function getKycSubmissionDetails(req, res) {
  try {
    const submissionId = req.params.id;

    const submission = await kycModel.getKycSubmissionDetails(submissionId);

    if (!submission) {
      return res.status(404).json({ message: "KYC submission not found" });
    }

    res.status(200).json(submission);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}


/**
 * Decides which model function to call for approving KYC.
 *
 * @param {object} req
 * @param {object} res
 *
 * @returns {Promise<void>}
 */
async function approveKycSubmission(req, res) {
  try {
    const submissionId = req.params.id;
    const adminId = req.body.admin_id;
    const reason = req.body.reason || null;

    const approved = await kycModel.approveKycSubmission(
      submissionId,
      adminId,
      reason
    );

    if (!approved) {
      return res.status(404).json({
        message: "KYC submission not found or already reviewed"
      });
    }

    console.log(`KYC submission ${submissionId} approved`);
    res.status(200).json({
      message: `KYC submission ${submissionId} approved`
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}


/**
 * Decides which model function to call for rejecting KYC.
 *
 * @param {object} req
 * @param {object} res
 *
 * @returns {Promise<void>}
 */
async function rejectKycSubmission(req, res) {
  try {
    const submissionId = req.params.id;
    const adminId = req.body.admin_id;
    const reason = req.body.reason;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        message: "Rejection reason is required"
      });
    }

    const rejected = await kycModel.rejectKycSubmission(
      submissionId,
      adminId,
      reason
    );

    if (!rejected) {
      return res.status(404).json({
        message: "KYC submission not found or already reviewed"
      });
    }

    console.log(`KYC submission ${submissionId} rejected`);
    res.status(200).json({
      message: `KYC submission ${submissionId} rejected`
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
}


module.exports = {getPendingKycSubmissions, getKycSubmissionDetails,approveKycSubmission, rejectKycSubmission};//// export controller functions to kycRoutes.js
