import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { WASTE_CATEGORIES } from '../../utils/constants';
import {
  buildListingPayload,
  todayIsoDate,
  validateListingForm,
} from '../../data/wasteListing';
import ActionButton from './ActionButton';
import PhotoPicker from './PhotoPicker';
import PickupScheduleFields from './PickupScheduleFields';

const EMPTY_FORM = {
  category: '',
  subCategory: '',
  estimatedWeightKg: '',
  suggestedPriceBdt: '',
  photos: [],
  notes: '',
  address: '',
  requestPickupNow: true,
  pickupDate: '',
  windowStart: '',
  windowEnd: '',
};

const fieldClass = 'mt-1.5 w-full rounded-2xl border border-mist bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20';

/**
 * Short household form to add a waste listing (FR-03).
 * @param {object} props Component props.
 * @param {Function} props.onCreate Persists the listing.
 * @param {Function} [props.onCancel] Closes the form without saving.
 * @returns {JSX.Element} The add-waste form.
 */
function CreateListingForm({ onCreate, onCancel }) {
  const [values, setValues] = useState({
    ...EMPTY_FORM,
    pickupDate: todayIsoDate(),
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const minDate = useMemo(() => todayIsoDate(), []);

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateListingForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      await onCreate(buildListingPayload(values));
    } catch (err) {
      setErrors({ form: err.message || 'Could not save this listing.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.75rem] border border-mist bg-white p-5 sm:p-6"
      noValidate
    >
      <h2 className="font-display text-2xl text-ink">Add waste</h2>
      <p className="mt-1 text-sm text-ink/65">
        Four quick details. Pickup is requested unless you turn it off.
      </p>

      {errors.form ? (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {errors.form}
        </p>
      ) : null}

      <div className="mt-5">
        <p className="text-sm font-medium text-forest">What is it?</p>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Waste category">
          {WASTE_CATEGORIES.map((category) => {
            const active = values.category === category;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={active}
                onClick={() => setField('category', category)}
                className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                  active ? 'bg-lime text-ink shadow-sm' : 'bg-foam text-forest hover:bg-sand'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
        {errors.category ? <p className="mt-1.5 text-xs text-red-700">{errors.category}</p> : null}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-forest" htmlFor="listing-weight">
          Weight (kg)
          <input
            id="listing-weight"
            name="estimatedWeightKg"
            type="number"
            min="0.1"
            step="0.1"
            placeholder="e.g. 5"
            value={values.estimatedWeightKg}
            onChange={(event) => setField('estimatedWeightKg', event.target.value)}
            className={fieldClass}
          />
          {errors.estimatedWeightKg ? (
            <p className="mt-1 text-xs text-red-700">{errors.estimatedWeightKg}</p>
          ) : null}
        </label>
        <label className="block text-sm font-medium text-forest" htmlFor="listing-price">
          Price (BDT)
          <input
            id="listing-price"
            name="suggestedPriceBdt"
            type="number"
            min="0"
            step="1"
            placeholder="e.g. 80"
            value={values.suggestedPriceBdt}
            onChange={(event) => setField('suggestedPriceBdt', event.target.value)}
            className={fieldClass}
          />
          {errors.suggestedPriceBdt ? (
            <p className="mt-1 text-xs text-red-700">{errors.suggestedPriceBdt}</p>
          ) : null}
        </label>
      </div>

      <div className="mt-5">
        <PhotoPicker
          photos={values.photos}
          error={errors.photos}
          onChange={(photos) => setField('photos', photos)}
        />
      </div>

      <div className="mt-5 rounded-2xl bg-foam/80 p-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-forest" htmlFor="listing-request-pickup">
          <input
            id="listing-request-pickup"
            name="requestPickupNow"
            type="checkbox"
            checked={values.requestPickupNow}
            onChange={(event) => setField('requestPickupNow', event.target.checked)}
            className="h-4 w-4 rounded border-mist text-forest focus:ring-leaf"
          />
          Ask a collector to pick this up
        </label>
        {values.requestPickupNow ? (
          <div className="mt-4">
            <PickupScheduleFields
              idPrefix="create-pickup"
              pickupDate={values.pickupDate}
              windowStart={values.windowStart}
              windowEnd={values.windowEnd}
              minDate={minDate}
              errors={errors}
              onChange={({ name, value }) => setField(name, value)}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <ActionButton type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save listing'}
        </ActionButton>
        {onCancel ? (
          <ActionButton variant="ghost" onClick={onCancel}>Cancel</ActionButton>
        ) : null}
      </div>
    </form>
  );
}

CreateListingForm.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
};

CreateListingForm.defaultProps = {
  onCancel: undefined,
};

export default CreateListingForm;
