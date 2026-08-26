import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ImagePlus, X } from 'lucide-react';
import { MAX_PHOTOS } from '../../data/wasteListing';

const ACCEPTED = 'image/jpeg,image/png,image/webp';
const MAX_BYTES = 2 * 1024 * 1024;

/**
 * Read a File as a data URL.
 * @param {File} file Image file.
 * @returns {Promise<string>} Data URL.
 */
function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error('Could not read photo.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Photo picker with a 5-image cap (FR-03).
 * @param {object} props Component props.
 * @param {string[]} props.photos Data URLs already attached.
 * @param {Function} props.onChange Called with the next photos array.
 * @param {string} [props.error] Validation message.
 * @returns {JSX.Element} Photo grid + file input.
 */
function PhotoPicker({ photos, onChange, error = '' }) {
  const [fileError, setFileError] = useState('');
  const remaining = MAX_PHOTOS - photos.length;
  const shownError = fileError || error;

  const handleFiles = async (event) => {
    const input = event.target;
    const selected = Array.from(input.files || []);
    input.value = '';
    if (!selected.length || remaining <= 0) {
      return;
    }
    const accepted = selected.slice(0, remaining);
    const tooLarge = accepted.find((file) => file.size > MAX_BYTES);
    if (tooLarge) {
      setFileError(`Each photo must be ${MAX_BYTES / (1024 * 1024)} MB or smaller.`);
      return;
    }
    const notImage = accepted.find((file) => !file.type.startsWith('image/'));
    if (notImage) {
      setFileError('Only JPEG, PNG, or WebP photos are allowed.');
      return;
    }
    const urls = await Promise.all(accepted.map(readAsDataUrl));
    setFileError('');
    onChange([...photos, ...urls]);
  };

  const removeAt = (index) => {
    setFileError('');
    onChange(photos.filter((_, photoIndex) => photoIndex !== index));
  };

  return (
    <div>
      <p className="text-sm font-medium text-forest">
        Photos
        <span className="ml-2 font-normal text-ink/55">
          {`Optional, up to ${MAX_PHOTOS}`}
        </span>
      </p>
      <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {photos.map((src) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-2xl border border-mist bg-foam">
            <img src={src} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              aria-label="Remove attached waste listing"
              onClick={() => removeAt(photos.indexOf(src))}
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink shadow-sm hover:bg-white"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
        {remaining > 0 ? (
          <label
            htmlFor="listing-photos"
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-leaf/40 bg-white text-forest transition hover:bg-lime/30"
          >
            <ImagePlus className="h-5 w-5" aria-hidden="true" />
            <span className="text-[0.7rem] font-semibold uppercase tracking-wide">Add</span>
            <input
              id="listing-photos"
              name="photos"
              type="file"
              accept={ACCEPTED}
              multiple
              className="sr-only"
              onChange={handleFiles}
            />
          </label>
        ) : null}
      </div>
      {shownError ? <p className="mt-1.5 text-xs text-red-700">{shownError}</p> : null}
    </div>
  );
}

PhotoPicker.propTypes = {
  photos: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
};

PhotoPicker.defaultProps = {
  error: '',
};

export default PhotoPicker;
