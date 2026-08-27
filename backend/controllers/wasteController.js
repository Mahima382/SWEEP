const wasteModel = require('../models/wasteModel');

function getListings(req, res) {
    res.status(501).json({
        message: 'Waste listings not implemented yet (FR-03)'
    });
}

async function getPickups(req, res) {
    try {
        const { collectorId, date } = req.query;

        if (!collectorId) {
            return res.status(400).json({
                message: 'collectorId is required'
            });
        }

        const pickupDate =
            date || new Date().toISOString().split('T')[0];

        const pickups = await wasteModel.findByCollectorAndDate(
            collectorId,
            pickupDate
        );

        return res.json({
            date: pickupDate,
            pickups
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to retrieve pickup schedule'
        });
    }
}

async function acceptPickup(req, res) {
    try {
        const { collectorId } = req.body;
        const { id } = req.params;

        if (!collectorId) {
            return res.status(400).json({
                message: 'collectorId is required'
            });
        }

        const pickup = await wasteModel.findById(id);

        if (!pickup) {
            return res.status(404).json({
                message: 'Pickup not found'
            });
        }

        if (pickup.status !== 'PENDING') {
            return res.status(409).json({
                message: 'Pickup is no longer available'
            });
        }

        const existingSchedule =
            await wasteModel.findByCollectorAndDate(
                collectorId,
                pickup.pickup_date
            );

        const DAILY_CAPACITY = 10;

        if (existingSchedule.length >= DAILY_CAPACITY) {
            return res.status(409).json({
                message: 'Daily pickup capacity reached'
            });
        }

        const updated =
            await wasteModel.acceptPickup(id, collectorId);

        if (!updated) {
            return res.status(409).json({
                message: 'Pickup could not be accepted'
            });
        }

        return res.json({
            message: 'Pickup accepted successfully'
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to accept pickup'
        });
    }
}

async function declinePickup(req, res) {
    try {
        const { reason } = req.body;
        const { id } = req.params;

        if (!reason || !reason.trim()) {
            return res.status(400).json({
                message: 'Decline reason is required'
            });
        }

        const pickup = await wasteModel.findById(id);

        if (!pickup) {
            return res.status(404).json({
                message: 'Pickup not found'
            });
        }

        if (pickup.status !== 'PENDING') {
            return res.status(409).json({
                message: 'Only pending pickups can be declined'
            });
        }

        const updated =
            await wasteModel.declinePickup(id, reason.trim());

        if (!updated) {
            return res.status(409).json({
                message: 'Pickup could not be declined'
            });
        }

        return res.json({
            message: 'Pickup declined successfully'
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to decline pickup'
        });
    }
}

async function updatePickupStatus(req, res) {
    try {
        const { status, actualWeight } = req.body;
        const { id } = req.params;

        const allowedStatuses = [
            'EN_ROUTE',
            'ARRIVED',
            'COLLECTED',
            'COMPLETED'
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid pickup status'
            });
        }

        const pickup = await wasteModel.findById(id);

        if (!pickup) {
            return res.status(404).json({
                message: 'Pickup not found'
            });
        }

        const transitions = {
            ACCEPTED: 'EN_ROUTE',
            EN_ROUTE: 'ARRIVED',
            ARRIVED: 'COLLECTED',
            COLLECTED: 'COMPLETED'
        };

        if (transitions[pickup.status] !== status) {
            return res.status(409).json({
                message: `Invalid status transition from ${pickup.status} to ${status}`
            });
        }

        if (
            status === 'COMPLETED' &&
            (actualWeight === undefined ||
             actualWeight === null ||
             Number(actualWeight) <= 0)
        ) {
            return res.status(400).json({
                message: 'Actual weight is required before completion'
            });
        }

        await wasteModel.updateStatus(
            id,
            status,
            actualWeight
        );

        return res.json({
            message: 'Pickup status updated successfully'
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Failed to update pickup status'
        });
    }
}

module.exports = {
    getListings,
    getPickups,
    acceptPickup,
    declinePickup,
    updatePickupStatus
};
