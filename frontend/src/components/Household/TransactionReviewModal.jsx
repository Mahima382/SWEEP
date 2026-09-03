import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';
import { validateReview } from '../../data/walletPayout';

const fieldClass = 'mt-1.5 w-full rounded-2xl border border-mist bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20';

/**
 * Modal to rate a confirmed pickup earning (FR-04).
 * @param {object} props Component props.
 * @param {object} props.transaction Earning being reviewed.
 * @param {Function} props.onClose Close handler.
 * @param {Function} props.onSubmit Persist the review.
 * @returns {JSX.Element} Dialog.
 */
function TransactionReviewModal({ transaction, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateReview({ rating, comment });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(transaction.id, { rating, comment });
    } catch (err) {
      setErrors({ form: err.message || 'Could not save this review.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Close review dialog"
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-lg sm:p-6"
        noValidate
      >
        <h2 id="review-title" className="font-display text-2xl text-ink">
          Review pickup
        </h2>
        <p className="mt-1 text-sm text-ink/65">
          {transaction.id}
          {transaction.reference ? ` · ${transaction.reference}` : ''}
        </p>

        {errors.form ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {errors.form}
          </p>
        ) : null}

        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-forest">Rating</legend>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} ${star === 1 ? 'star' : 'stars'}`}
                  aria-pressed={active}
                  onClick={() => setRating(star)}
                  className="rounded-lg p-1 text-leaf"
                >
                  <Star
                    className={`h-7 w-7 ${active ? 'fill-leaf text-leaf' : 'text-mist'}`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
          {errors.rating ? (
            <p className="mt-1.5 text-xs text-red-700">{errors.rating}</p>
          ) : null}
        </fieldset>

        <label className="mt-5 block text-sm font-medium text-forest" htmlFor="review-comment">
          Comment (optional)
          <textarea
            id="review-comment"
            name="comment"
            rows="3"
            maxLength="280"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className={fieldClass}
          />
          {errors.comment ? (
            <p className="mt-1 text-xs text-red-700">{errors.comment}</p>
          ) : null}
        </label>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border-2 border-forest/30 bg-white px-4 py-2 text-sm font-semibold text-forest"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? 'Saving…' : 'Submit review'}
          </button>
        </div>
      </form>
    </div>
  );
}

TransactionReviewModal.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.string.isRequired,
    reference: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default TransactionReviewModal;
