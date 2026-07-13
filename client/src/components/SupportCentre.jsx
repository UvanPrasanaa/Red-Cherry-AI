import { useState, useRef } from 'react';

const ISSUE_TYPES = ['Bug or error', 'Account or login', 'Inappropriate content', 'Billing', 'Something else'];

export default function SupportCentre({ onClose }) {
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0]);
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto({ name: file.name, dataUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    // No backend endpoint exists yet for support tickets — this simply
    // confirms receipt in the UI. Wire this up to a real endpoint
    // (e.g. functions/api/support.js) when you're ready to receive these.
    setSubmitted(true);
  };

  return (
    <div className="overlay-page" role="dialog" aria-modal="true" aria-label="Support Centre">
      <div className="overlay-page__header">
        <button type="button" className="overlay-page__back" onClick={onClose} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="overlay-page__title">Support Centre</div>
      </div>
      <div className="overlay-page__body">
        {submitted ? (
          <div className="support-confirm">
            <div className="support-confirm__mark">✓</div>
            <h3>Thanks — we've got it</h3>
            <p>Your report has been recorded. We'll look into it as soon as we can.</p>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="support-form" onSubmit={handleSubmit}>
            <label className="support-form__label" htmlFor="issue-type">
              What's the issue about?
            </label>
            <select
              id="issue-type"
              className="support-form__select"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
            >
              {ISSUE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <label className="support-form__label" htmlFor="issue-description">
              Describe what happened
            </label>
            <textarea
              id="issue-description"
              className="support-form__textarea"
              placeholder="Tell us what went wrong, and what you expected to happen instead…"
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <label className="support-form__label">Add a photo (optional)</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="support-form__file-input"
              onChange={handlePhotoChange}
            />
            <button type="button" className="support-form__photo-btn" onClick={() => fileInputRef.current?.click()}>
              {photo ? 'Change photo' : 'Attach a screenshot or photo'}
            </button>
            {photo && (
              <div className="support-form__preview">
                <img src={photo.dataUrl} alt="Attached preview" />
                <span>{photo.name}</span>
                <button type="button" onClick={() => setPhoto(null)} aria-label="Remove photo">
                  ×
                </button>
              </div>
            )}

            <button type="submit" className="btn-primary support-form__submit" disabled={!description.trim()}>
              Submit report
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
