/**
 * Waste model - data access for listings and pickups.
 * Model layer only: no Express imports.
 */

const db = require('../config/db');

async function findByHousehold(householdId) {
    const [rows] = await db.execute(
        `SELECT *
         FROM pickups
         WHERE household_id = ?
         ORDER BY pickup_date, pickup_time`,
        [householdId]
    );

    return rows;
}

async function findPendingPickups() {
    const [rows] = await db.execute(
        `SELECT *
         FROM pickups
         WHERE status = 'PENDING'
         ORDER BY pickup_date, pickup_time`
    );

    return rows;
}

async function findByCollectorAndDate(collectorId, pickupDate) {
    const [rows] = await db.execute(
        `SELECT *
         FROM pickups
         WHERE collector_id = ?
           AND pickup_date = ?
           AND status NOT IN ('DECLINED', 'COMPLETED')
         ORDER BY pickup_time`,
        [collectorId, pickupDate]
    );

    return rows;
}

async function findById(pickupId) {
    const [rows] = await db.execute(
        `SELECT *
         FROM pickups
         WHERE id = ?`,
        [pickupId]
    );

    return rows[0] || null;
}

async function acceptPickup(pickupId, collectorId) {
    const [result] = await db.execute(
        `UPDATE pickups
         SET collector_id = ?,
             status = 'ACCEPTED'
         WHERE id = ?
           AND status = 'PENDING'`,
        [collectorId, pickupId]
    );

    return result.affectedRows;
}

async function declinePickup(pickupId, reason) {
    const [result] = await db.execute(
        `UPDATE pickups
         SET status = 'DECLINED',
             decline_reason = ?
         WHERE id = ?
           AND status = 'PENDING'`,
        [reason, pickupId]
    );

    return result.affectedRows;
}

async function updateStatus(pickupId, status, actualWeight = null) {
    const [result] = await db.execute(
        `UPDATE pickups
         SET status = ?,
             actual_weight = COALESCE(?, actual_weight)
         WHERE id = ?`,
        [status, actualWeight, pickupId]
    );

    return result.affectedRows;
}

module.exports = {
    findByHousehold,
    findPendingPickups,
    findByCollectorAndDate,
    findById,
    acceptPickup,
    declinePickup,
    updateStatus
};
