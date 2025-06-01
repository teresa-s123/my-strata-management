// pages/login.js - MINIMAL VERSION
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { setUserSession, isLoggedIn } from '../lib/cookies';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Demo user for testing
  const demoUser = {
    name: 'John Smith',
    email: 'john.smith@email.com',
    unitNumber: '101'
  };

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
      // Simple demo login
      if (email.toLowerCase() === demoUser.email) {
        const session = setUserSession(demoUser);
        
        if (session) {
          router.push('/dashboard');
        } else {
          setError('Failed to create session');
        }
      } else {
        setError('Please use: john.smith@email.com');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Login">
      <div className="container" style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
        <h1>🏢 Oceanview Login</h1>
        
        <div style={{ 
          background: '#e8f4f8', 
          padding: '1rem', 
          marginBottom: '2rem', 
          borderRadius: '8px' 
        }}>
          <strong>🍪 Cookie Demo:</strong> This login uses cookies for session management.
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.smith@email.com"
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
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? 'Logging in...' : 'Login with Cookies 🍪'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <strong>Demo Email:</strong> john.smith@email.com
        </div>
      </div>
    </Layout>
  );
}