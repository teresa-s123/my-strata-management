// pages/dashboard.js
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function Dashboard() {
  const [stats, setStats] = useState({
    maintenance: { total: 0, pending: 0, inProgress: 0, completed: 0, emergency: 0 },
    levy: { totalDue: 0, totalPaid: 0, overdue: 0, collectionRate: 0 },
    units: { total: 0, occupied: 0, vacant: 0 },
    recent: { maintenance: [], payments: [] }
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Sample data for demonstration
      const sampleStats = {
        maintenance: {
          total: 12,
          pending: 3,
          inProgress: 4,
          completed: 5,
          emergency: 0
        },
        levy: {
          totalDue: 240000,
          totalPaid: 220000,
          overdue: 2,
          collectionRate: 91.7
        },
        units: {
          total: 48,
          occupied: 45,
          vacant: 3
        },
        recent: {
          maintenance: [
            {
              request_id: 'MR12345',
              units: { unit_number: '304' },
              description: 'Kitchen tap leaking - needs urgent repair',
              status: 'pending',
              priority: 'normal',
              created_at: new Date().toISOString()
            },
            {
              request_id: 'MR12344',
              units: { unit_number: '507' },
              description: 'Air conditioning not working properly',
              status: 'in-progress',
              priority: 'high',
              created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
            },
            {
              request_id: 'MR12343',
              units: { unit_number: '201' },
              description: 'Bathroom light fixture replacement',
              status: 'completed',
              priority: 'low',
              created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
            }
          ],
          payments: [
            {
              units: { unit_number: '201' },
              owners: { first_name: 'John', last_name: 'Smith' },
              amount: 2500,
              quarter: 2,
              year: 2024,
              paid_date: new Date().toISOString()
            },
            {
              units: { unit_number: '105' },
              owners: { first_name: 'Sarah', last_name: 'Johnson' },
              amount: 2200,
              quarter: 2,
              year: 2024,
              paid_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
            }
          ]
        }
      };

      // Try to load real data from database, fall back to sample data
      try {
        const { data: maintenanceData } = await supabase
          .from('maintenance_requests')
          .select('status, priority, created_at');

        if (maintenanceData && maintenanceData.length > 0) {
          sampleStats.maintenance = {
            total: maintenanceData.length,
            pending: maintenanceData.filter(r => r.status === 'pending').length,
            inProgress: maintenanceData.filter(r => r.status === 'in-progress').length,
            completed: maintenanceData.filter(r => r.status === 'completed').length,
            emergency: maintenanceData.filter(r => r.priority === 'emergency').length
          };
        }
      } catch (error) {
        console.log('Using sample data - database not available');
      }

      setStats(sampleStats);
      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const badgeStyles = {
      'pending': { background: '#fff3cd', color: '#856404', border: '1px solid #ffeaa7' },
      'in-progress': { background: '#d1ecf1', color: '#0c5460', border: '1px solid #bee5eb' },
      'completed': { background: '#d4edda', color: '#155724', border: '1px solid #c3e6cb' },
      'emergency': { background: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb' }
    };
    
    const style = badgeStyles[status] || { background: '#e9ecef', color: '#495057' };
    
    return (
      <span style={{
        ...style,
        padding: '0.25rem 0.5rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Loading Dashboard...</h2>
          <p>Fetching building data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ color: '#003366', margin: 0 }}>📊 Building Management Dashboard</h1>
          <div className="alert alert-success" style={{ 
            margin: 0,
            padding: '0.5rem 1rem',
            fontSize: '0.9rem'
          }}>
            📊 Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Maintenance Overview */}
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#003366' }}>🔧 Recent Maintenance</h3>
            {stats.recent.maintenance.map((request, index) => (
              <div key={request.request_id} style={{ 
                padding: '0.75rem', 
                borderBottom: index < stats.recent.maintenance.length - 1 ? '1px solid #eee' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#003366', fontSize: '0.95rem' }}>
                    {request.request_id} - Unit {request.units?.unit_number}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem', lineHeight: '1.3' }}>
                    {request.description?.substring(0, 50)}...
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                    {new Date(request.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ marginLeft: '1rem' }}>
                  {getStatusBadge(request.status)}
                </div>
              </div>
            ))}
            {stats.recent.maintenance.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                No recent maintenance requests
              </div>
            )}
          </div>

          {/* Recent Payments */}
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#003366' }}>💰 Recent Payments</h3>
            {stats.recent.payments.map((payment, index) => (
              <div key={index} style={{ 
                padding: '0.75rem', 
                borderBottom: index < stats.recent.payments.length - 1 ? '1px solid #eee' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#003366', fontSize: '0.95rem' }}>
                    Unit {payment.units?.unit_number}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                    {payment.owners?.first_name} {payment.owners?.last_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                    Q{payment.quarter}/{payment.year}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#28a745', fontSize: '1rem' }}>
                    {formatCurrency(payment.amount)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>
                    {new Date(payment.paid_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {stats.recent.payments.length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                No recent payments
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#003366' }}>⚡ Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <button
              onClick={() => window.location.href = '/maintenance'}
              className="btn"
              style={{
                padding: '1rem',
                textAlign: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            >
              🔧 Submit Maintenance Request
            </button>
            <button
              onClick={() => window.location.href = '/levies'}
              className="btn btn-secondary"
              style={{
                padding: '1rem',
                textAlign: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                background: '#28a745'
              }}
            >
              💰 View Levy Payments
            </button>
            <button
              onClick={() => window.location.href = '/documents'}
              className="btn btn-secondary"
              style={{
                padding: '1rem',
                textAlign: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                background: '#17a2b8'
              }}
            >
              📋 Access Documents
            </button>
            <button
              onClick={() => window.location.href = '/reports'}
              className="btn btn-secondary"
              style={{
                padding: '1rem',
                textAlign: 'center',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                background: '#6f42c1'
              }}
            >
              📊 Generate Reports
            </button>
          </div>
        </div>

        <div style={{ 
          background: '#e8f4f8', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#0c5460',
          border: '1px solid #bee5eb'
        }}>
          <strong>📊 Dashboard:</strong> Real-time building management insights and quick access to key functions
        </div>
      </div>
    </Layout>
  );
}366', fontSize: '1.1rem' }}>🔧 Maintenance Requests</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#003366', marginBottom: '0.5rem' }}>
              {stats.maintenance.total}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pending:</span>
                <span style={{ color: '#856404', fontWeight: 'bold' }}>{stats.maintenance.pending}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>In Progress:</span>
                <span style={{ color: '#0c5460', fontWeight: 'bold' }}>{stats.maintenance.inProgress}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Completed:</span>
                <span style={{ color: '#155724', fontWeight: 'bold' }}>{stats.maintenance.completed}</span>
              </div>
            </div>
            {stats.maintenance.emergency > 0 && (
              <div className="alert alert-danger" style={{ 
                margin: '1rem 0 0 0',
                padding: '0.5rem',
                fontSize: '0.85rem',
                fontWeight: 'bold'
              }}>
                🚨 {stats.maintenance.emergency} Emergency Request{stats.maintenance.emergency !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Levy Collection */}
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#003366', fontSize: '1.1rem' }}>💰 Levy Collection</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#28a745', marginBottom: '0.5rem' }}>
              {stats.levy.collectionRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              <div style={{ marginBottom: '0.25rem' }}>Collected: {formatCurrency(stats.levy.totalPaid)}</div>
              <div>Outstanding: {formatCurrency(stats.levy.totalDue - stats.levy.totalPaid)}</div>
            </div>
            {stats.levy.overdue > 0 && (
              <div style={{ 
                background: '#fff3cd', 
                color: '#856404', 
                padding: '0.5rem', 
                borderRadius: '6px', 
                marginTop: '1rem',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                border: '1px solid #ffeaa7'
              }}>
                ⚠️ {stats.levy.overdue} Overdue Payment{stats.levy.overdue !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Units Occupancy */}
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#003366', fontSize: '1.1rem' }}>🏠 Unit Occupancy</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#003366', marginBottom: '0.5rem' }}>
              {stats.units.total}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Occupied:</span>
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>{stats.units.occupied}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Vacant:</span>
                <span style={{ color: '#dc3545', fontWeight: 'bold' }}>{stats.units.vacant}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Rate:</span>
                <span style={{ fontWeight: 'bold' }}>
                  {stats.units.total > 0 ? ((stats.units.occupied / stats.units.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Recent Maintenance */}
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#003