import React, { useEffect, useState } from 'react';
import {
  getPickups,
  acceptPickup,
  declinePickup,
  updatePickupStatus
} from '../services/pickupService';

function CollectorPickupSchedule() {
  const collectorId = 1;

  const [date, setDate] = useState('2026-08-28');
  const [data, setData] = useState({
    pickups: [],
    capacity: 10,
    acceptedCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadPickups() {
    try {
      setLoading(true);

      const result = await getPickups(
        collectorId,
        date
      );

      setData(result);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPickups();
  }, [date]);

  async function handleAccept(id) {
    try {
      await acceptPickup(id, collectorId);
      setMessage('Pickup accepted.');
      await loadPickups();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleDecline(id) {
    const reason = window.prompt(
      'Why are you declining this pickup?'
    );

    if (!reason) return;

    try {
      await declinePickup(id, reason);
      setMessage('Pickup declined.');
      await loadPickups();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleStatus(id, status) {
    try {
      let actualWeight;

      if (status === 'COMPLETED') {
        actualWeight = window.prompt(
          'Enter actual weight in kg:'
        );

        if (!actualWeight) return;
      }

      await updatePickupStatus(
        id,
        status,
        actualWeight
      );

      setMessage('Pickup status updated.');
      await loadPickups();
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (loading) {
    return <p>Loading pickup schedule...</p>;
  }

  return (
    <section style={{ padding: '24px' }}>
      <h1>Collector Pickup Schedule</h1>

      <label>
        Pickup Date:{' '}
        <input
          type="date"
          value={date}
          onChange={(event) =>
            setDate(event.target.value)
          }
        />
      </label>

      <p>
        Capacity: {data.acceptedCount} / {data.capacity}
      </p>

      {message && (
        <p>
          <strong>{message}</strong>
        </p>
      )}

      {data.pickups.length === 0 && (
        <p>No pickup requests for this date.</p>
      )}

      {data.pickups.map((pickup) => (
        <article
          key={pickup.id}
          style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '16px'
          }}
        >
          <h2>{pickup.household}</h2>

          <p>
            <strong>Address:</strong>{' '}
            {pickup.address}
          </p>

          <p>
            <strong>Waste:</strong>{' '}
            {pickup.wasteType}
          </p>

          <p>
            <strong>Estimated weight:</strong>{' '}
            {pickup.estimatedWeight} kg
          </p>

          <p>
            <strong>Time:</strong>{' '}
            {pickup.pickupTime}
          </p>

          <p>
            <strong>Status:</strong>{' '}
            {pickup.status}
          </p>

          {pickup.status === 'PENDING' && (
            <>
              <button
                onClick={() =>
                  handleAccept(pickup.id)
                }
              >
                Accept
              </button>

              <button
                onClick={() =>
                  handleDecline(pickup.id)
                }
                style={{ marginLeft: '8px' }}
              >
                Decline
              </button>
            </>
          )}

          {pickup.status === 'ACCEPTED' && (
            <button
              onClick={() =>
                handleStatus(
                  pickup.id,
                  'EN_ROUTE'
                )
              }
            >
              Start Pickup
            </button>
          )}

          {pickup.status === 'EN_ROUTE' && (
            <button
              onClick={() =>
                handleStatus(
                  pickup.id,
                  'ARRIVED'
                )
              }
            >
              Mark Arrived
            </button>
          )}

          {pickup.status === 'ARRIVED' && (
            <button
              onClick={() =>
                handleStatus(
                  pickup.id,
                  'COLLECTED'
                )
              }
            >
              Mark Collected
            </button>
          )}

          {pickup.status === 'COLLECTED' && (
            <button
              onClick={() =>
                handleStatus(
                  pickup.id,
                  'COMPLETED'
                )
              }
            >
              Complete Pickup
            </button>
          )}
        </article>
      ))}
    </section>
  );
}

export default CollectorPickupSchedule;