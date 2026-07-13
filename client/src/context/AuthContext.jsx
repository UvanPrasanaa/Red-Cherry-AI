import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
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

  // Firebase Auth natively supports displayName + photoURL. Phone/email
  // beyond what the sign-in provider gave us aren't part of core Firebase
  // Auth without extra setup (phone auth / Firestore), so we persist those
  // locally for now — swap this for a Firestore write once you add one.
  const updateUserProfile = useCallback(
    async ({ displayName, photoURL, phone, email }) => {
      if (!auth.currentUser) return;
      try {
        await updateProfile(auth.currentUser, { displayName, photoURL });
        if (phone) localStorage.setItem('rc_phone', phone);
        if (email) localStorage.setItem('rc_email', email);
        // Force a refresh so components reading `user` see the new values.
        setUser({ ...auth.currentUser });
      } catch (err) {
        console.error('Profile update failed:', err);
      }
    },
    []
  );

  const value = {
    user,
    loading,
    authError,
    isGuest: !!user?.isAnonymous,
    signInWithGoogle,
    continueAsGuest,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
