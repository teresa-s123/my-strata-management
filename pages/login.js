// pages/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { setUserCookie, getUserCookie, isUserLoggedIn } from '../lib/cookies';

export default function Login() {
  const [unitNumber, setUnitNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { reason } = router.query;

  // Demo users for testing (adapted for Oceanview Apartments)
  const demoUsers = [
    { unitNumber: '101', name: 'John Smith', email: 'john.smith@email.com', unitType: '2BR Apartment' },
    { unitNumber: '205', name: 'Emily Johnson', email: 'emily.johnson@email.com', unitType: '3BR Apartment' },
    { unitNumber: '103', name: 'Michael Brown', email: 'michael.brown@email.com', unitType: '1BR Studio' },
    { unitNumber: '312', name: 'Sarah Wilson', email: 'sarah.wilson@email.com', unitType: 'Penthouse' }
  ];

  useEffect(() => {
    // Redirect if already logged in
    if (isUserLoggedIn()) {
      router.push('/dashboard');
      return;
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Demo login for Oceanview Apartments
      const demoUser = demoUsers.find(u => 
        u.unitNumber === unitNumber && u.email.toLowerCase() === email.toLowerCase().trim()
      );

      if (!demoUser) {
        setError('Invalid demo credentials. Please use the provided demo accounts.');
        return;
      }

      // Create demo session
      const sessionData = setUserCookie({
        id: Math.random().toString(36).substring(7),
        name: demoUser.name,
        email: demoUser.email,
        unit_number: demoUser.unitNumber,
        unit_type: demoUser.unitType,
        unit_id: Math.random().toString(36).substring(7)
      });

      if (sessionData) {
        router.push('/dashboard');
      } else {
        setError('Failed to create demo session. Please try again.');
      }

    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitChange = (selectedUnit) => {
    setUnitNumber(selectedUnit);
    
    // Auto-fill demo email
    const demoUser = demoUsers.find(u => u.unitNumber === selectedUnit);
    if (demoUser) {
      setEmail(demoUser.email);
    } else {
      setEmail('');
    }
  };

  return (
    <Layout title="Unit Owner Login">
      <div className="container" style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '500px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: '#0070f3', marginBottom: '0.5rem', fontSize: '2rem' }}>
              🏢 Oceanview Apartments
            </h1>
            <h2 style={{ color: '#333', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
              Unit Owner Login
            </h2>
            <p style={{ color: '#666', margin: 0 }}>
              Access your strata management portal
            </p>
            
            {reason === 'timeout' && (
              <div className="alert alert-danger" style={{ marginTop: '1rem' }}>
                ⏰ Your session expired due to inactivity. Please log in again.
              </div>
            )}
          </div>

          <div style={{
            background: '#e8f4f8',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            fontSize: '0.9rem',
            border: '1px solid #0070f3'
          }}>
            <strong>🍪 Cookie Demo:</strong> This login system uses cookies to remember your session across page visits. 
            Your login status will persist even if you refresh the page or navigate away and come back.
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="unitNumber">Unit Number</label>
              <select
                id="unitNumber"
                className="form-control"
                value={unitNumber}
                onChange={(e) => handleUnitChange(e.target.value)}
                required
              >
                <option value="">Select your unit</option>
                {demoUsers.map(user => (
                  <option key={user.unitNumber} value={user.unitNumber}>
                    Unit {user.unitNumber} - {user.name} ({user.unitType})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
              />
            </div>

            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn"
              disabled={loading || !unitNumber || !email}
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: '600',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Logging in...' : 'Login & Set Cookie 🍪'}
            </button>
          </form>

          <div style={{
            textAlign: 'center',
            marginTop: '2rem',
            fontSize: '0.9rem',
            color: '#666'
          }}>
            <p><strong>Demo credentials available:</strong></p>
            <div style={{ 
              fontSize: '0.8rem', 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              Unit 101: john.smith@email.com<br />
              Unit 205: emily.johnson@email.com<br />
              Unit 103: michael.brown@email.com<br />
              Unit 312: sarah.wilson@email.com
            </div>
          </div>

          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#f0f8ff',
            borderRadius: '6px',
            fontSize: '0.8rem',
            color: '#0c5460',
            border: '1px solid #bee5eb'
          }}>
            <strong>🔒 Cookie Security Features:</strong>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
              <li>Secure flag in production (HTTPS only)</li>
              <li>SameSite protection against CSRF</li>
              <li>7-day expiration with auto-cleanup</li>
              <li>Session validation and timeout</li>
              <li>Activity tracking and auto-logout</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
}