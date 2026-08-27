router.get('/listings', wasteController.getListings);

router.get('/pickups', wasteController.getPickups);

router.patch(
    '/pickups/:id/accept',
    wasteController.acceptPickup
);

router.patch(
    '/pickups/:id/decline',
    wasteController.declinePickup
);

router.patch(
    '/pickups/:id/status',
    wasteController.updatePickupStatus
);