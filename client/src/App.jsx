import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import ChatApp from './components/ChatApp';
import './styles/global.css';

function Gate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: 'var(--text-muted)' }}>
        Loading…
      </div>
    );
  }

  return user ? <ChatApp /> : <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
