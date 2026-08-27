import api from './api';

export function getPickups(collectorId, date) {
  return api.get(
    `/waste/pickups?collectorId=${collectorId}&date=${date}`
  );
}

export function acceptPickup(id, collectorId) {
  return api.patch(
    `/waste/pickups/${id}/accept`,
    { collectorId }
  );
}

export function declinePickup(id, reason) {
  return api.patch(
    `/waste/pickups/${id}/decline`,
    { reason }
  );
}

export function updatePickupStatus(
  id,
  status,
  actualWeight
) {
  return api.patch(
    `/waste/pickups/${id}/status`,
    {
      status,
      ...(actualWeight !== undefined && { actualWeight })
    }
  );
}