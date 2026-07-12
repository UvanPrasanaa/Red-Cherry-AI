import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      // Popup-closed-by-user isn't really an "error" worth surfacing.
      if (err?.code !== 'auth/popup-closed-by-user') {
        console.error('Google sign-in failed:', err);
        setAuthError('Could not sign in with Google. Please try again.');
      }
    }
  }, []);

  const continueAsGuest = useCallback(async () => {
    setAuthError('');
    try {
      await signInAnonymously(auth);
    } catch (err) {
      console.error('Guest sign-in failed:', err);
      setAuthError('Could not start a guest session. Please try again.');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  }, []);

  const value = {
    user,
    loading,
    authError,
    isGuest: !!user?.isAnonymous,
    signInWithGoogle,
    continueAsGuest,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
