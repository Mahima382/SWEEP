import React from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  lime: 'bg-lime !text-ink shadow-md shadow-leaf/20 hover:bg-white hover:-translate-y-0.5',
  forest: 'bg-forest !text-white shadow-md shadow-forest/20 hover:bg-leaf hover:-translate-y-0.5',
  ghost: 'border-2 border-forest/30 bg-white !text-forest hover:border-forest hover:bg-lime',
  danger: 'border-2 border-red-300 bg-white !text-red-700 hover:bg-red-50',
};

/**
 * Rounded action control used on household listing screens.
 * @param {object} props Component props.
 * @param {React.ReactNode} props.children Button label.
 * @param {'lime'|'forest'|'ghost'|'danger'} [props.variant] Colour treatment.
 * @param {'button'|'submit'} [props.type] Native button type.
 * @param {boolean} [props.disabled] Disabled state.
 * @param {string} [props.className] Extra classes.
 * @param {Function} [props.onClick] Click handler.
 * @returns {JSX.Element} A native button.
 */
function ActionButton({
  children,
  variant = 'forest',
  type = 'button',
  disabled = false,
  className = '',
  onClick,
}) {
  return (
    <button
      type={type === 'submit' ? 'submit' : 'button'}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

ActionButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['lime', 'forest', 'ghost', 'danger']),
  type: PropTypes.oneOf(['button', 'submit']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

ActionButton.defaultProps = {
  variant: 'forest',
  type: 'button',
  disabled: false,
  className: '',
  onClick: undefined,
};

export default ActionButton;
