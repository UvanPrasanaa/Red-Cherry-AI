import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMemories, removeMemory, clearMemories, isMemoryEnabled, setMemoryEnabled as persistMemoryEnabled } from '../utils/memory';

const ROWS = [
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'terms', label: 'Terms and Conditions' },
  { key: 'community', label: 'Community Guidelines' },
];

export default function SettingsModal({ onClose, onOpenLegal, onOpenSupport }) {
  const { user, isGuest, signOut } = useAuth();
  const uid = user?.uid;
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [memoryListOpen, setMemoryListOpen] = useState(false);
  const [memories, setMemories] = useState([]);
  const [loadingMemory, setLoadingMemory] = useState(true);

  // Memory now lives in Firestore under the signed-in account, so it's
  // fetched fresh whenever this modal opens (and follows the user across
  // devices, unlike the old localStorage version).
  useEffect(() => {
    if (!uid) {
      setLoadingMemory(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const [enabled, facts] = await Promise.all([isMemoryEnabled(uid), getMemories(uid)]);
      if (!cancelled) {
        setMemoryEnabled(enabled);
        setMemories(facts);
        setLoadingMemory(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const toggleMemory = async () => {
    const next = !memoryEnabled;
    setMemoryEnabled(next);
    if (uid) await persistMemoryEnabled(uid, next);
  };

  const handleRemoveMemory = async (index) => {
    if (!uid) return;
    setMemories(await removeMemory(uid, index));
  };

  const handleClearMemories = async () => {
    if (!uid) return;
    setMemories(await clearMemories(uid));
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel modal-panel--settings" role="dialog" aria-modal="true" aria-label="Settings" onClick={(e) => e.stopPropagation()}>
        <div className="modal-panel__header">
          <h3>Settings</h3>
          <button type="button" className="modal-panel__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="settings-list">
          <div className="settings-section">
            <div className="settings-row">
              <div>
                <div className="settings-row__label">Name</div>
                <div className="settings-row__value">{isGuest ? 'Guest' : user?.displayName || 'Not set'}</div>
              </div>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row__label">Memory</div>
                <div className="settings-row__value">Let RedCherry AI remember details across chats</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={memoryEnabled}
                className={`settings-toggle ${memoryEnabled ? 'settings-toggle--on' : ''}`}
                onClick={toggleMemory}
              >
                <span className="settings-toggle__knob" />
              </button>
            </div>

            <button type="button" className="settings-nav-row" onClick={() => setMemoryListOpen((v) => !v)}>
              <span>Manage memory ({loadingMemory ? '…' : memories.length})</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                style={{ transform: memoryListOpen ? 'rotate(90deg)' : 'none' }}
              >
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {memoryListOpen && (
              <div className="settings-memory-list">
                {memories.length === 0 ? (
                  <p className="settings-memory-empty">
                    Nothing saved yet. Say things like "remember I'm vegetarian" or tell it your name, and it'll show up here.
                  </p>
                ) : (
                  <>
                    {memories.map((fact, i) => (
                      <div key={`${fact}-${i}`} className="settings-memory-item">
                        <span>{fact}</span>
                        <button type="button" onClick={() => handleRemoveMemory(i)} aria-label="Forget this">
                          ×
                        </button>
                      </div>
                    ))}
                    <button type="button" className="settings-memory-clear" onClick={handleClearMemories}>
                      Clear all memory
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="settings-section">
            {ROWS.map((row) => (
              <button key={row.key} type="button" className="settings-nav-row" onClick={() => onOpenLegal(row.key)}>
                <span>{row.label}</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ))}
          </div>

          <div className="settings-section">
            <button type="button" className="settings-nav-row" onClick={onOpenSupport}>
              <span>Support Centre</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {!confirmingLogout ? (
              <button type="button" className="settings-nav-row settings-nav-row--danger" onClick={() => setConfirmingLogout(true)}>
                <span>Log out</span>
              </button>
            ) : (
              <div className="settings-logout-confirm">
                <p>Log out of RedCherry AI?</p>
                <div className="settings-logout-confirm__actions">
                  <button type="button" className="btn-secondary" onClick={() => setConfirmingLogout(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn-danger" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
