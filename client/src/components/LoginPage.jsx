import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.56 2.7-3.87 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.16.27-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { signInWithGoogle, continueAsGuest, authError } = useAuth();
  const [pendingAction, setPendingAction] = useState(null);

  const handleGoogle = async () => {
    setPendingAction('google');
    await signInWithGoogle();
    setPendingAction(null);
  };

  const handleGuest = async () => {
    setPendingAction('guest');
    await continueAsGuest();
    setPendingAction(null);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-card__terminal" aria-hidden="true">
          <div className="login-card__dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="login-card__line">
            <span className="login-card__prompt">$</span> booting red-cherry-ai/core...
          </div>
          <div className="login-card__line">
            <span className="login-card__prompt">$</span> model: llama-3.3-70b-versatile
          </div>
          <div className="login-card__line">
            <span className="login-card__prompt">$</span> awaiting authentication
            <span className="login-card__cursor"></span>
          </div>
        </div>

        <div className="login-card__body">
          <h1 className="login-card__title">Red Cherry AI</h1>
          <p className="login-card__subtitle">
            Sign in to start chatting with a fast, no-nonsense AI assistant.
          </p>

          <div className="login-card__actions">
            <button
              type="button"
              className="auth-btn auth-btn--google"
              onClick={handleGoogle}
              disabled={pendingAction !== null}
            >
              <GoogleIcon />
              {pendingAction === 'google' ? 'Signing in…' : 'Continue with Google'}
            </button>

            <div className="login-card__divider">or</div>

            <button
              type="button"
              className="auth-btn auth-btn--guest"
              onClick={handleGuest}
              disabled={pendingAction !== null}
            >
              {pendingAction === 'guest' ? 'Starting session…' : 'Continue as Guest'}
            </button>
          </div>

          {authError && <div className="login-card__error" role="alert">{authError}</div>}

          <div className="login-card__footer">
            Built by <strong>Uvan Prasanaa V</strong> · Co-developed by <strong>Sukesh D</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
