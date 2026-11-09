
const db = require("../config/db"); // import database connection


/**
 * Retrieves all pending KYC submissions from collectors and companies.
 *
 * @returns {Promise<Array>}
 */
async function getPendingKycSubmissions() {

    const command = `
        SELECT 
            k.id AS submission_id,
            k.user_id,
            u.name,
            u.email,
            u.phone,
            u.role,
            k.status,
            k.submitted_at
        FROM kyc_submissions k
        JOIN users u ON k.user_id = u.id
        WHERE k.status = ?
        AND u.role IN ('local_collector', 'global_collector', 'company')
        ORDER BY k.submitted_at ASC;
    `;

    const [rows] = await db.query(command, ["pending"]);

    return rows;
}


/**
 * Retrieves one KYC submission along with its documents.
 *
 * @param {number | string} submissionId - the ID of the KYC submission
 * @returns {Promise<Object | null>}
 */
async function getKycSubmissionDetails(submissionId) {

    let command = `
        SELECT
            k.*,
            u.name,
            u.email,
            u.phone,
            u.nid,
            u.role
        FROM kyc_submissions k
        JOIN users u ON k.user_id = u.id
        WHERE k.id = ?;
    `;

    const [submissions] = await db.query(command, [submissionId]);

    if (submissions.length === 0) {
        return null;
    }

    command = `
        SELECT *
        FROM kyc_documents
        WHERE submission_id = ?;
    `;

    const [documents] = await db.query(command, [submissionId]);

    return {
        ...submissions[0],
        documents
    };
}


/**
 * Approves a KYC submission and records the admin action.
 *
 * @param {number | string} submissionId - the ID of the KYC submission
 * @param {number | string} adminId - the ID of the admin approving it
 * @param {string | null} reason - optional approval reason
 * @returns {Promise<boolean>}
 */
async function approveKycSubmission(submissionId, adminId, reason = null) {

    const command = `
        UPDATE kyc_submissions
        SET status = ?,
            reviewed_by = ?,
            reviewed_at = CURRENT_TIMESTAMP,
            decision_reason = ?
        WHERE id = ? AND status = ?;
    `;

    const [result] = await db.query(
        command,
        ["approved", adminId, reason, submissionId, "pending"]
    );

    if (result.affectedRows === 0) {
        return false;
    }

    const logCommand = `
        INSERT INTO user_admin_actions (user_id, admin_id, action, reason)
        SELECT user_id, ?, ?, ?
        FROM kyc_submissions
        WHERE id = ?;
    `;

    await db.query(logCommand, [
        adminId,
        "kyc_approve",
        reason,
        submissionId
    ]);

    return true;
}


/**
 * Rejects a KYC submission and records the admin action.
 *
 * @param {number | string} submissionId - the ID of the KYC submission
 * @param {number | string} adminId - the ID of the admin rejecting it
 * @param {string} reason - the reason for rejection
 * @returns {Promise<boolean>}
 */
async function rejectKycSubmission(submissionId, adminId, reason) {

    const command = `
        UPDATE kyc_submissions
        SET status = ?,
            reviewed_by = ?,
            reviewed_at = CURRENT_TIMESTAMP,
            decision_reason = ?
        WHERE id = ? AND status = ?;
    `;

    const [result] = await db.query(
        command,
        ["rejected", adminId, reason, submissionId, "pending"]
    );

    if (result.affectedRows === 0) {
        return false;
    }

    const logCommand = `
        INSERT INTO user_admin_actions (user_id, admin_id, action, reason)
        SELECT user_id, ?, ?, ?
        FROM kyc_submissions
        WHERE id = ?;
    `;

    await db.query(logCommand, [
        adminId,
        "kyc_reject",
        reason,
        submissionId
    ]);

    return true;
}


module.exports = {getPendingKycSubmissions, getKycSubmissionDetails, approveKycSubmission, rejectKycSubmission}; // export functions to controller
