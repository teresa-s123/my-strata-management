// pages/dashboard.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';
import { 
  getUserCookie, 
  removeUserCookie, 
  getSessionDuration, 
  getPreferencesCookie,
  setPreferencesCookie,
  getCookieStats,
  setupAutoLogout,
  validateSession,
  updateLastActivity
} from '../lib/cookies';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRequests, setUserRequests] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [preferences, setPreferences] = useState({});
  const [cookieStats, setCookieStats] = useState({});
  const [showCookieDetails, setShowCookieDetails] = useState(false);
  const router = useRouter();

  // Demo data for when Supabase is not available
  const demoRequests = [
    {
      id: 1,
      request_id: 'REQ-2025-001',
      title: 'Leaky Faucet Repair',
      status: 'pending',
      created_at: '2025-06-01T09:00:00Z',
      description: 'Kitchen faucet is leaking consistently'
    },
    {
      id: 2,
      request_id: 'REQ-2025-002', 
      title: 'Air Conditioning Service',
      status: 'completed',
      created_at: '2025-05-28T14:30:00Z',
      description: 'Annual HVAC maintenance and filter replacement'
    },
    {
      id: 3,
      request_id: 'REQ-2025-003',
      title: 'Elevator Noise Issue',
      status: 'in-progress', 
      created_at: '2025-05-25T16:45:00Z',
      description: 'Strange noises coming from elevator shaft'
    }
  ];

  const demoPayments = [
    {
      id: 1,
      amount: 1250.00,
      due_date: '2025-06-15',
      status: 'paid',
      payment_date: '2025-05-30',
      description: 'Q2 2025 Levy Payment',
      reference: 'LEVY-Q2-2025'
    },
    {
      id: 2,
      amount: 1250.00,
      due_date: '2025-09-15',
      status: 'pending',
      description: 'Q3 2025 Levy Payment', 
      reference: 'LEVY-Q3-2025'
    },
    {
      id: 3,
      amount: 350.00,
      due_date: '2025-07-01',
      status: 'overdue',
      description: 'Special Assessment - Building Maintenance',
      reference: 'SPEC-ASSESS-2025-01'
    }
  ];

  useEffect(() => {
    // Validate session and redirect if invalid
    if (!validateSession()) {
      router.push('/login');
      return;
    }

    const userData = getUserCookie();
    if (!userData) {
      router.push('/login');
      return;
    }

    setUser(userData);
    setSessionInfo(getSessionDuration());
    setPreferences(getPreferencesCookie());
    setCookieStats(getCookieStats());
    
    // Setup auto-logout
    setupAutoLogout();

    // Load user-specific data
    loadUserData(userData);
    
    setLoading(false);

    // Update session info and stats periodically
    const interval = setInterval(() => {
      if (validateSession()) {
        setSessionInfo(getSessionDuration());
        setCookieStats(getCookieStats());
        updateLastActivity();
      } else {
        router.push('/login?reason=timeout');
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [router]);

  const loadUserData = async (userData) => {
    try {
      // Try to load from Supabase
      const { data: requests, error: requestsError } = await supabase
        .from('maintenance_requests')
        .select('*')
        .eq('unit_id', userData.unitId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!requestsError && requests) {
        setUserRequests(requests);
      } else {
        // Use demo data
        setUserRequests(demoRequests);
      }

      const { data: payments, error: paymentsError } = await supabase
        .from('levy_payments')
        .select('*')
        .eq('unit_id', userData.unitId)
        .order('due_date', { ascending: false })
        .limit(5);

      if (!paymentsError && payments) {
        setUserPayments(payments);
      } else {
        // Use demo data
        setUserPayments(demoPayments);
      }

    } catch (error) {
      console.warn('Database not available, using demo data');
      setUserRequests(demoRequests);
      setUserPayments(demoPayments);
    }
  };

  const handleLogout = () => {
    removeUserCookie();
    router.push('/login');
  };

  const updatePreference = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    setPreferencesCookie(newPrefs);
    
    // Show feedback
    showNotification(`${key} preference updated and saved to cookies!`);
    
    // Apply theme immediately if changed
    if (key === 'theme') {
      applyTheme(value);
    }
  };

  const applyTheme = (theme) => {
    const body = document.body;
    
    if (theme === 'dark') {
      body.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d3748 100%)';
      body.style.color = '#ffffff';
    } else {
      body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
      body.style.color = '#333333';
    }
  };

  const showNotification = (message) => {
    // Simple notification system
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffc107',
      'in-progress': '#0070f3',
      'completed': '#28a745',
      'paid': '#28a745',
      'overdue': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusBadgeStyle = (status) => ({
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: status === 'pending' ? '#000' : 'white',
    background: getStatusColor(status)
  });

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Loading your personalized dashboard...</h2>
          <p>Checking cookie authentication...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <Layout title="My Dashboard">
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* User Header */}
        <div style={{
          background: 'linear-gradient(135deg, #003366 0%, #0070f3 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          position: 'relative'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem 0' }}>
                Welcome back, {user.name}! 👋
              </h1>
              <p style={{ margin: 0, opacity: 0.9 }}>
                Unit {user.unitNumber} ({user.unitType}) • Session: {sessionInfo?.hours || 0}h {sessionInfo?.minutes || 0}m
              </p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.3)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
            >
              Logout & Clear Cookies 🍪
            </button>
          </div>

          {/* Session Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{sessionInfo?.totalMinutes || 0}</div>
              <div>Minutes Active</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{cookieStats.totalCookies}</div>
              <div>Total Cookies</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{cookieStats.loginHistory}</div>
              <div>Login Sessions</div>
            </div>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#003366', margin: 0 }}>
              🍪 Cookie-Based Session Management Demo
            </h3>
            <button
              onClick={() => setShowCookieDetails(!showCookieDetails)}
              style={{
                background: '#0070f3',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showCookieDetails ? 'Hide Details' : 'Show Cookie Details'}
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <strong>Session ID:</strong><br />
              <code style={{ fontSize: '0.8rem', background: '#f8f9fa', padding: '0.25rem', borderRadius: '4px' }}>
                {user.sessionId?.substring(0, 12)}...
              </code>
            </div>
            <div>
              <strong>Login Time:</strong><br />
              {new Date(user.loginTime).toLocaleString()}
            </div>
            <div>
              <strong>Last Activity:</strong><br />
              {user.lastActivity ? new Date(user.lastActivity).toLocaleTimeString() : 'Now'}
            </div>
            <div>
              <strong>Auto-logout:</strong><br />
              <span style={{ color: preferences.autoLogout ? '#28a745' : '#dc3545' }}>
                {preferences.autoLogout ? 'Enabled (30 min)' : 'Disabled'}
              </span>
            </div>
          </div>

          {showCookieDetails && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
              <strong>Current Cookie Values:</strong>
              <pre style={{ fontSize: '0.8rem', marginTop: '0.5rem', overflow: 'auto' }}>
                {JSON.stringify({
                  user_session: {
                    sessionId: user.sessionId,
                    name: user.name,
                    unitNumber: user.unitNumber,
                    loginTime: user.loginTime
                  },
                  preferences: preferences,
                  stats: cookieStats
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* User Preferences Panel */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#003366', marginTop: 0, marginBottom: '1rem' }}>
            ⚙️ Your Preferences (Stored in Cookies)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Theme:
              </label>
              <select
                value={preferences.theme || 'light'}
                onChange={(e) => updatePreference('theme', e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', width: '100%' }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                <input
                  type="checkbox"
                  checked={preferences.notifications !== false}
                  onChange={(e) => updatePreference('notifications', e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                Email Notifications
              </label>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Language:
              </label>
              <select
                value={preferences.language || 'en'}
                onChange={(e) => updatePreference('language', e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', width: '100%' }}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Dashboard Layout:
              </label>
              <select
                value={preferences.dashboardLayout || 'grid'}
                onChange={(e) => updatePreference('dashboardLayout', e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', width: '100%' }}
              >
                <option value="grid">Grid View</option>
                <option value="list">List View</option>
                <option value="compact">Compact View</option>
              </select>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '1rem', marginBottom: 0 }}>
            💡 These preferences are automatically saved in cookies and persist across sessions until you log out.
          </p>
        </div>

        {/* Dashboard Content */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          {/* Recent Maintenance Requests */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#003366', marginTop: 0, marginBottom: '1rem' }}>
              🔧 Your Recent Maintenance Requests
            </h3>
            {userRequests.length > 0 ? (
              <div>
                {userRequests.map(request => (
                  <div key={request.id} style={{
                    padding: '1rem',
                    margin: '0.5rem 0',
                    border: '1px solid #eee',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${getStatusColor(request.status)}`
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                      {request.request_id}: {request.title}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      Status: <span style={getStatusBadgeStyle(request.status)}>
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    {request.description && (
                      <div style={{ fontSize: '0.9rem', color: '#777', marginBottom: '0.5rem' }}>
                        {request.description}
                      </div>
                    )}
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                      Submitted: {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => showNotification('New maintenance request form opened!')}
                  style={{
                    background: '#0070f3',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginTop: '1rem',
                    width: '100%'
                  }}
                >
                  Submit New Request
                </button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <p>No maintenance requests found.</p>
                <button
                  onClick={() => showNotification('New maintenance request form opened!')}
                  style={{
                    background: '#0070f3',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Submit Your First Request
                </button>
              </div>
            )}
          </div>

          {/* Financial Summary */}
          <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ color: '#003366', marginTop: 0, marginBottom: '1rem' }}>
              💰 Levy Payments & Fees
            </h3>
            {userPayments.length > 0 ? (
              <div>
                {userPayments.map(payment => (
                  <div key={payment.id} style={{
                    padding: '1rem',
                    margin: '0.5rem 0',
                    border: '1px solid #eee',
                    borderRadius: '6px',
                    borderLeft: `4px solid ${getStatusColor(payment.status)}`
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                      {payment.description || payment.reference}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                      Amount: <strong>{formatCurrency(payment.amount)}</strong> • 
                      Status: <span style={getStatusBadgeStyle(payment.status)}>
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                      Due: {new Date(payment.due_date).toLocaleDateString()}
                      {payment.payment_date && (
                        <span> • Paid: {new Date(payment.payment_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    onClick={() => showNotification('Payment portal opened!')}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    Make Payment
                  </button>
                  <button
                    onClick={() => showNotification('Payment history downloaded!')}
                    style={{
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    View History
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                <p>No payment records found.</p>
              </div>
            )}
          </div>
        </div>

        {/* Cookie Technical Details */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '10px',
          marginTop: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#003366', marginTop: 0, marginBottom: '1rem' }}>
            🔧 Cookie Technical Implementation
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h4 style={{ marginBottom: '1rem' }}>Session Cookie (strata_user)</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                <li>Stores user ID, name, unit information</li>
                <li>Includes unique session ID for tracking</li>
                <li>Expires after 7 days automatically</li>
                <li>Secure & HttpOnly flags enabled</li>
                <li>Activity tracking with timestamps</li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ marginBottom: '1rem' }}>Preferences Cookie (strata_preferences)</h4>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                <li>Theme, language, layout settings</li>
                <li>Notification preferences</li>
                <li>Auto-logout configuration</li>
                <li>Persists across login sessions</li>
                <li>Real-time updates and validation</li>
              </ul>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '6px' }}>
            <strong>Security Features:</strong>
            <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>✅ HTTPS-only transmission</div>
              <div>✅ CSRF protection (SameSite)</div>
              <div>✅ Automatic expiration</div>
              <div>✅ Session validation</div>
              <div>✅ Activity-based timeout</div>
              <div>✅ Secure cookie flags</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}