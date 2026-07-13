import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfileModal({ onClose }) {
  const { user, isGuest, updateUserProfile } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phoneNumber || localStorage.getItem('rc_phone') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoPreview, setPhotoPreview] = useState(user?.photoURL || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateUserProfile({ displayName: name, photoURL: photoPreview, phone, email });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" role="dialog" aria-modal="true" aria-label="Edit profile" onClick={(e) => e.stopPropagation()}>
        <div className="modal-panel__header">
          <h3>Edit profile</h3>
          <button type="button" className="modal-panel__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form className="profile-form" onSubmit={handleSave}>
          <div className="profile-form__photo">
            <div className="profile-form__avatar">
              {photoPreview ? (
                <img src={photoPreview} alt="" />
              ) : (
                <span>{(name || 'G')[0]?.toUpperCase()}</span>
              )}
            </div>
            <div className="profile-form__photo-actions">
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handlePhoto} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="user" hidden onChange={handlePhoto} />
              <button type="button" onClick={() => cameraInputRef.current?.click()}>
                Camera
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()}>
                Photos
              </button>
            </div>
          </div>

          <label className="profile-form__label" htmlFor="profile-name">
            Name
          </label>
          <input
            id="profile-name"
            className="profile-form__input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isGuest ? 'Guest' : 'Your name'}
            disabled={isGuest}
          />

          <label className="profile-form__label" htmlFor="profile-phone">
            Phone number
          </label>
          <input
            id="profile-phone"
            className="profile-form__input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Add a phone number"
            disabled={isGuest}
          />

          <label className="profile-form__label" htmlFor="profile-email">
            Email
          </label>
          <input
            id="profile-email"
            className="profile-form__input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isGuest || !!user?.email}
          />
          {isGuest && <p className="profile-form__hint">Sign in to save a profile.</p>}

          <button type="submit" className="btn-primary profile-form__save" disabled={isGuest || saving}>
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
