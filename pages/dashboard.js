// pages/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';
import { getUserSession, clearUserSession, isLoggedIn, setUserPreferences, getUserPreferences } from '../lib/cookies';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({});
  const [notification, setNotification] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }

    const userData = getUserSession();
    const userPrefs = getUserPreferences();
    
    setUser(userData);
    setPreferences(userPrefs);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    clearUserSession();
    showNotification('Logged out successfully!');
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  };

  const updatePreference = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    setUserPreferences(newPrefs);
    showNotification(`${key} preference updated!`);
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Loading your dashboard...</h2>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout title="Dashboard">
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#28a745',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000
        }}>
          {notification}
        </div>
      )}

      <div className="container" style={{ padding: '2rem' }}>
        {/* Welcome Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0070f3 0%, #0051a8 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '2rem' }}>
                Welcome, {user.name}! 👋
              </h1>
              <p style={{ margin: '0.5rem 0', opacity: 0.9, fontSize: '1.1rem' }}>
                Unit {user.unitNumber} - Oceanview Apartments
              </p>
              <p style={{ margin: 0, opacity: 0.8 }}>
                Session ID: {user.sessionId}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="btn"
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white'
              }}
            >
              Logout 🍪
            </button>
          </div>
        </div>

        {/* Cookie Demo Section */}
        <div style={{
          background: '#e8f4f8',
          padding: '1.5rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          border: '2px solid #0070f3'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#003366' }}>
            🍪 Cookie Session Active
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem' 
          }}>
            <div>
              <strong>Login Time:</strong><br />
              {new Date(user.loginTime).toLocaleString()}
            </div>
            <div>
              <strong>User Email:</strong><br />
              {user.email}
            </div>
            <div>
              <strong>Session Status:</strong><br />
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>Active</span>
            </div>
          </div>
        </div>

        {/* User Preferences */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ color: '#0070f3', marginTop: 0 }}>
            ⚙️ Your Preferences (Stored in Cookies)
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1rem' 
          }}>
            <div className="form-group">
              <label>Theme:</label>
              <select
                className="form-control"
                value={preferences.theme || 'light'}
                onChange={(e) => updatePreference('theme', e.target.value)}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Language:</label>
              <select
                className="form-control"
                value={preferences.language || 'en'}
                onChange={(e) => updatePreference('language', e.target.value)}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.notifications !== false}
                  onChange={(e) => updatePreference('notifications', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Email Notifications
              </label>
            </div>
          </div>
        </div>

        {/* Portal Navigation */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ color: '#0070f3', marginTop: 0 }}>
            🏢 Oceanview Portal
          </h3>
          <p style={{ marginBottom: '1.5rem', color: '#666' }}>
            Your session is active! Navigate to other sections of the portal:
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem' 
          }}>
            <Link href="/maintenance" className="btn" style={{ 
              textDecoration: 'none', 
              textAlign: 'center',
              padding: '1rem',
              display: 'block'
            }}>
              🔧 Maintenance
            </Link>
            <Link href="/levies" className="btn" style={{ 
              textDecoration: 'none', 
              textAlign: 'center',
              padding: '1rem',
              display: 'block'
            }}>
              💰 Levies
            </Link>
            <Link href="/documents" className="btn" style={{ 
              textDecoration: 'none', 
              textAlign: 'center',
              padding: '1rem',
              display: 'block'
            }}>
              📄 Documents
            </Link>
            <Link href="/contact" className="btn" style={{ 
              textDecoration: 'none', 
              textAlign: 'center',
              padding: '1rem',
              display: 'block'
            }}>
              📞 Contact
            </Link>
          </div>
        </div>

        {/* Cookie Technical Info */}
        <div style={{
          background: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '10px',
          border: '1px solid #dee2e6'
        }}>
          <h4 style={{ color: '#0070f3', marginTop: 0 }}>
            🔧 Cookie Implementation Details
          </h4>
          <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            <p><strong>✅ Session Management:</strong> Your login state is stored securely in browser cookies</p>
            <p><strong>✅ Preference Storage:</strong> Your settings persist across browser sessions</p>
            <p><strong>✅ Auto-logout:</strong> Session expires automatically for security</p>
            <p><strong>✅ Cross-page Persistence:</strong> Navigate freely while staying logged in</p>
          </div>
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: 'white', 
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontFamily: 'monospace'
          }}>
            <strong>Current Session Data:</strong>
            <pre style={{ margin: '0.5rem 0', overflow: 'auto' }}>
{JSON.stringify({
  user: {
    name: user.name,
    unitNumber: user.unitNumber,
    sessionId: user.sessionId.substring(0, 8) + '...'
  },
  preferences: preferences
}, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </Layout>
  );
}