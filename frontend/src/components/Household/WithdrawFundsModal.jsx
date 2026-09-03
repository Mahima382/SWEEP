import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { formatBdt } from '../../data/wallet';
import {
  PAYOUT_METHODS,
  PAYOUT_METHOD_LABELS,
  validateWithdrawal,
} from '../../data/walletPayout';

const fieldClass = 'mt-1.5 w-full rounded-2xl border border-mist bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-leaf focus:ring-2 focus:ring-leaf/20';

const METHODS = [
  PAYOUT_METHODS.BKASH,
  PAYOUT_METHODS.NAGAD,
  PAYOUT_METHODS.BANK,
];

/**
 * Modal to withdraw available funds to bKash, Nagad, or a bank account.
 * @param {object} props Component props.
 * @param {number} props.availableBdt Spendable balance.
 * @param {Function} props.onClose Close handler.
 * @param {Function} props.onSubmit Persist the withdrawal.
 * @returns {JSX.Element} Dialog.
 */
function WithdrawFundsModal({ availableBdt, onClose, onSubmit }) {
  const [values, setValues] = useState({
    amountBdt: String(availableBdt || ''),
    method: PAYOUT_METHODS.BKASH,
    account: '',
  });
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

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateWithdrawal(values, availableBdt);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        amountBdt: Number(values.amountBdt),
        method: values.method,
        account: values.account.replace(/\s/g, ''),
      });
    } catch (err) {
      setErrors({ form: err.message || 'Could not withdraw funds.' });
    } finally {
      setSubmitting(false);
    }
  };

  const accountLabel = values.method === PAYOUT_METHODS.BANK
    ? 'Account number'
    : 'Mobile number';
  const accountPlaceholder = values.method === PAYOUT_METHODS.BANK
    ? 'e.g. 123456789012'
    : '01XXXXXXXXX';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Close withdraw dialog"
        onClick={onClose}
      />
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="withdraw-title"
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-lg sm:p-6"
        noValidate
      >
        <h2 id="withdraw-title" className="font-display text-2xl text-ink">
          Withdraw Funds
        </h2>
        <p className="mt-1 text-sm text-ink/65">
          {'Available balance '}
          {formatBdt(availableBdt)}
          . Choose bKash, Nagad, or bank.
        </p>

        {errors.form ? (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {errors.form}
          </p>
        ) : null}

        <label className="mt-5 block text-sm font-medium text-forest" htmlFor="withdraw-amount">
          Amount (BDT)
          <input
            id="withdraw-amount"
            name="amountBdt"
            type="number"
            min="1"
            step="1"
            value={values.amountBdt}
            onChange={(event) => setField('amountBdt', event.target.value)}
            className={fieldClass}
          />
          {errors.amountBdt ? (
            <p className="mt-1 text-xs text-red-700">{errors.amountBdt}</p>
          ) : null}
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-medium text-forest">Payout method</legend>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Payout method">
            {METHODS.map((method) => {
              const active = values.method === method;
              return (
                <button
                  key={method}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setField('method', method)}
                  className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-lime text-ink shadow-sm'
                      : 'bg-foam text-forest hover:bg-sand'
                  }`}
                >
                  {PAYOUT_METHOD_LABELS[method]}
                </button>
              );
            })}
          </div>
          {errors.method ? (
            <p className="mt-1.5 text-xs text-red-700">{errors.method}</p>
          ) : null}
        </fieldset>

        <label className="mt-5 block text-sm font-medium text-forest" htmlFor="withdraw-account">
          {accountLabel}
          <input
            id="withdraw-account"
            name="account"
            type="text"
            inputMode="numeric"
            placeholder={accountPlaceholder}
            value={values.account}
            onChange={(event) => setField('account', event.target.value)}
            className={fieldClass}
          />
          {errors.account ? (
            <p className="mt-1 text-xs text-red-700">{errors.account}</p>
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
            disabled={submitting || availableBdt <= 0}
            className="rounded-xl bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitting ? 'Sending…' : 'Confirm withdrawal'}
          </button>
        </div>
      </form>
    </div>
  );
}

WithdrawFundsModal.propTypes = {
  availableBdt: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default WithdrawFundsModal;
