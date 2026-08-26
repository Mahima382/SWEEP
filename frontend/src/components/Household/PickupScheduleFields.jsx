import React from 'react';
import PropTypes from 'prop-types';
import { PICKUP_WINDOWS } from '../../data/wasteListing';

const fieldClass = 'mt-1.5 w-full rounded-2xl border border-mist bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20';

/**
 * Pickup date plus morning / afternoon / evening (FR-03 scheduling).
 * @param {object} props Component props.
 * @param {string} props.idPrefix Prefix for input ids.
 * @param {string} [props.pickupDate] Selected date (YYYY-MM-DD).
 * @param {string} [props.windowStart] Start time (HH:MM).
 * @param {string} [props.windowEnd] End time (HH:MM).
 * @param {string} [props.minDate] Earliest selectable date.
 * @param {object} [props.errors] Field-keyed error messages.
 * @param {Function} props.onChange Called with `{ name, value }` on change.
 * @returns {JSX.Element} Schedule fields.
 */
function PickupScheduleFields({
  idPrefix,
  pickupDate = '',
  windowStart = '',
  windowEnd = '',
  minDate,
  errors = {},
  onChange,
}) {
  const selectWindow = (window) => {
    onChange({ name: 'windowStart', value: window.start });
    onChange({ name: 'windowEnd', value: window.end });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-forest" htmlFor={`${idPrefix}-date`}>
        Pickup day
        <input
          id={`${idPrefix}-date`}
          name="pickupDate"
          type="date"
          min={minDate}
          value={pickupDate}
          onChange={(event) => onChange({ name: 'pickupDate', value: event.target.value })}
          className={fieldClass}
        />
        {errors.pickupDate ? <p className="mt-1 text-xs text-red-700">{errors.pickupDate}</p> : null}
      </label>
      <div>
        <p className="text-sm font-medium text-forest">Time of day</p>
        <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Pickup window">
          {PICKUP_WINDOWS.map((window) => {
            const active = windowStart === window.start && windowEnd === window.end;
            return (
              <button
                key={window.id}
                type="button"
                aria-pressed={active}
                onClick={() => selectWindow(window)}
                className={`rounded-2xl px-2 py-2.5 text-center text-sm font-medium transition ${
                  active ? 'bg-lime text-ink' : 'bg-white text-forest ring-1 ring-mist hover:bg-sand'
                }`}
              >
                {window.label}
                <span className="mt-0.5 block text-[0.7rem] font-normal opacity-70">
                  {window.hint}
                </span>
              </button>
            );
          })}
        </div>
        {errors.windowStart ? (
          <p className="mt-1.5 text-xs text-red-700">{errors.windowStart}</p>
        ) : null}
      </div>
    </div>
  );
}

PickupScheduleFields.propTypes = {
  idPrefix: PropTypes.string.isRequired,
  pickupDate: PropTypes.string,
  windowStart: PropTypes.string,
  windowEnd: PropTypes.string,
  minDate: PropTypes.string,
  errors: PropTypes.objectOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};

PickupScheduleFields.defaultProps = {
  pickupDate: '',
  windowStart: '',
  windowEnd: '',
  minDate: undefined,
  errors: {},
};

export default PickupScheduleFields;
