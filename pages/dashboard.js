// pages/dashboard.js - MINIMAL VERSION
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { getUserSession, clearUserSession, isLoggedIn } from '../lib/cookies';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }

    const userData = getUserSession();
    setUser(userData);
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    clearUserSession();
    router.push('/login');
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="container" style={{ padding: '2rem' }}>
          <h2>Loading...</h2>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout title="Dashboard">
      <div className="container" style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0070f3 0%, #0051a8 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: 0 }}>Welcome, {user.name}! 👋</h1>
              <p style={{ margin: '0.5rem 0', opacity: 0.9 }}>
                Unit {user.unitNumber} - Oceanview Apartments
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="btn"
              style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: '1px solid rgba(255,255,255,0.3)' 
              }}
            >
              Logout 🍪
            </button>
          </div>
        </div>

        {/* Cookie Demo */}
        <div style={{
          background: '#e8f4f8',
          padding: '1.5rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          border: '2px solid #0070f3'
        }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>🍪 Cookie Session Active</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <strong>Session ID:</strong><br />
              <code style={{ fontSize: '0.8rem' }}>
                {user.sessionId}
              </code>
            </div>
            <div>
              <strong>Login Time:</strong><br />
              {new Date(user.loginTime).toLocaleString()}
            </div>
            <div>
              <strong>User Email:</strong><br />
              {user.email}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '10px',
          border: '1px solid #dee2e6'
        }}>
          <h3>🏢 Oceanview Portal</h3>
          <p>Your session is active! Navigate to other sections:</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button 
              onClick={() => router.push('/maintenance')}
              className="btn"
            >
              🔧 Maintenance
            </button>
            <button 
              onClick={() => router.push('/levies')}
              className="btn"
            >
              💰 Levies
            </button>
            <button 
              onClick={() => router.push('/documents')}
              className="btn"
            >
              📄 Documents
            </button>
            <button 
              onClick={() => router.push('/contact')}
              className="btn"
            >
              📞 Contact
            </button>
          </div>
        </div>

        {/* Cookie Info */}
        <div style={{
          background: '#f8f9fa',
          padding: '1rem',
          borderRadius: '6px',
          marginTop: '2rem',
          fontSize: '0.9rem'
        }}>
          <strong>Cookie Demo Working! ✅</strong>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
            <li>Session persists across page refreshes</li>
            <li>Secure cookie storage in browser</li>
            <li>Auto-redirect when not logged in</li>
            <li>Clean logout functionality</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}