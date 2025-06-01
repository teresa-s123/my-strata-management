// pages/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { setUserSession, isLoggedIn } from '../lib/cookies';

export default function Login() {
  const [email, setEmail] = useState('');
  const [unitNumber, setUnitNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Demo users for Oceanview Apartments
  const demoUsers = [
    { email: 'john.smith@email.com', name: 'John Smith', unitNumber: '101' },
    { email: 'sarah.jones@email.com', name: 'Sarah Jones', unitNumber: '205' },
    { email: 'mike.wilson@email.com', name: 'Mike Wilson', unitNumber: '312' }
  ];

  useEffect(() => {
    // Redirect if already logged in
    if (isLoggedIn()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Find matching demo user
      const user = demoUsers.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.unitNumber === unitNumber
      );

      if (user) {
        const session = setUserSession(user);
        
        if (session) {
          router.push('/dashboard');
        } else {
          setError('Failed to create session');
        }
      } else {
        setError('Invalid email or unit number. Please check the demo credentials below.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitChange = (selectedUnit) => {
    setUnitNumber(selectedUnit);
    // Auto-fill email for demo
    const user = demoUsers.find(u => u.unitNumber === selectedUnit);
    if (user) {
      setEmail(user.email);
    }
  };

  return (
    <Layout title="Login">
      <div className="container" style={{ 
        padding: '2rem', 
        maxWidth: '500px', 
        margin: '2rem auto',
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ textAlign: 'center', color: '#0070f3', marginBottom: '2rem' }}>
          🏢 Oceanview Login
        </h1>
        
        <div style={{ 
          background: '#e8f4f8', 
          padding: '1rem', 
          marginBottom: '2rem', 
          borderRadius: '8px',
          border: '1px solid #0070f3'
        }}>
          <strong>🍪 Cookie Demo:</strong> This login system uses cookies to remember your session across page visits.
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Unit Number</label>
            <select
              className="form-control"
              value={unitNumber}
              onChange={(e) => handleUnitChange(e.target.value)}
              required
            >
              <option value="">Select your unit</option>
              {demoUsers.map(user => (
                <option key={user.unitNumber} value={user.unitNumber}>
                  Unit {user.unitNumber} - {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
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
            disabled={loading || !email || !unitNumber}
            style={{ 
              width: '100%',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : 'Login with Cookies 🍪'}
          </button>
        </form>

        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#f8f9fa', 
          borderRadius: '6px',
          fontSize: '0.9rem'
        }}>
          <strong>Demo Credentials:</strong>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.2rem' }}>
            <li>Unit 101: john.smith@email.com</li>
            <li>Unit 205: sarah.jones@email.com</li>
            <li>Unit 312: mike.wilson@email.com</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}