// pages/login.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { setUserCookie, getUserCookie, isUserLoggedIn } from '../lib/cookies';

export default function Login() {
  const [unitNumber, setUnitNumber] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [units, setUnits] = useState([]);
  const [showDemo, setShowDemo] = useState(false);
  const router = useRouter();
  const { reason } = router.query;

  // Demo users for testing
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

    // Load units from Supabase or use demo data
    async function loadUnits() {
      try {
        const { data, error } = await supabase
          .from('units')
          .select(`
            *,
            owners (
              first_name,
              last_name,
              email
            )
          `)
          .order('unit_number');

        if (error) {
          console.warn('Supabase not available, using demo data');
          setShowDemo(true);
          return;
        }
        
        setUnits(data || []);
      } catch (err) {
        console.warn('Database not available, using demo data');
        setShowDemo(true);
      }
    }

    loadUnits();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (showDemo) {
        // Demo login
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
          first_name: demoUser.name.split(' ')[0],
          last_name: demoUser.name.split(' ')[1],
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

      } else {
        // Real login with Supabase
        const { data: owners, error } = await supabase
          .from('owners')
          .select(`
            *,
            units (
              id,
              unit_number,
              unit_type,
              square_meters
            )
          `)
          .eq('email', email.toLowerCase().trim());

        if (error) throw error;

        if (!owners || owners.length === 0) {
          setError('No account found with this email address.');
          return;
        }

        const owner = owners.find(o => o.units.unit_number === unitNumber);
        
        if (!owner) {
          setError('Email does not match the selected unit. Please check your details.');
          return;
        }

        const userSession = setUserCookie(owner);
        
        if (userSession) {
          router.push('/dashboard');
        } else {
          setError('Failed to create session. Please try again.');
        }
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
    
    if (showDemo) {
      // Auto-fill demo email
      const demoUser = demoUsers.find(u => u.unitNumber === selectedUnit);
      if (demoUser) {
        setEmail(demoUser.email);
      } else {
        setEmail('');
      }
    } else {
      // Auto-fill email from database
      const unit = units.find(u => u.unit_number === selectedUnit);
      if (unit && unit.owners && unit.owners.length > 0) {
        setEmail(unit.owners[0].email);
      } else {
        setEmail('');
      }
    }
  };

  return (
    <Layout title="Unit Owner Login">
      <div style={{ 
        minHeight: '80vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
      }}>
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '500px',
          margin: '2rem'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: '#003366', marginBottom: '0.5rem' }}>
              🏢 Unit Owner Login
            </h1>
            <p style={{ color: '#666', margin: 0 }}>
              Access your strata management portal
            </p>
            
            {reason === 'timeout' && (
              <div style={{
                background: '#fff3cd',
                color: '#856404',
                padding: '0.75rem',
                borderRadius: '6px',
                marginTop: '1rem',
                fontSize: '0.9rem'
              }}>
                ⏰ Your session expired due to inactivity. Please log in again.
              </div>
            )}
          </div>

          <div style={{
            background: '#e8f4f8',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            fontSize: '0.9rem'
          }}>
            <strong>🍪 Cookie Demo:</strong> This login system uses cookies to remember your session across page visits. 
            Your login status will persist even if you refresh the page or navigate away and come back.
            {showDemo && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#0c5460' }}>
                <strong>Demo Mode:</strong> Using sample data for demonstration purposes.
              </div>
            )}
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#333'
              }}>
                Unit Number
              </label>
              <select
                value={unitNumber}
                onChange={(e) => handleUnitChange(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0070f3'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              >
                <option value="">Select your unit</option>
                {showDemo ? (
                  demoUsers.map(user => (
                    <option key={user.unitNumber} value={user.unitNumber}>
                      Unit {user.unitNumber} - {user.name} ({user.unitType})
                    </option>
                  ))
                ) : (
                  units.map(unit => (
                    <option key={unit.id} value={unit.unit_number}>
                      Unit {unit.unit_number} ({unit.unit_type})
                      {unit.owners && unit.owners.length > 0 && ` - ${unit.owners[0].first_name} ${unit.owners[0].last_name}`}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#333'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0070f3'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              />
            </div>

            {error && (
              <div style={{
                background: '#f8d7da',
                color: '#721c24',
                padding: '0.75rem',
                borderRadius: '6px',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                border: '1px solid #f5c6cb'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !unitNumber || !email}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: loading ? '#6c757d' : '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s'
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
            <p>Demo credentials available:</p>
            <div style={{ fontSize: '0.8rem', background: '#f8f9fa', padding: '0.5rem', borderRadius: '4px' }}>
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
            color: '#0c5460'
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