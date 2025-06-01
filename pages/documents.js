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

  // Real-time subscription setup
  useEffect(() => {
    // Initial data load
    loadDashboardData();

    // Set up real-time subscriptions for live updates
    const maintenanceSubscription = supabase
      .channel('maintenance_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'maintenance_requests'
      }, (payload) => {
        console.log('Real-time maintenance update:', payload);
        loadDashboardData(); // Reload data when changes occur
        setLastUpdate(new Date());
      })
      .subscribe();

    const levySubscription = supabase
      .channel('levy_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'levy_payments'
      }, (payload) => {
        console.log('Real-time levy update:', payload);
        loadDashboardData();
        setLastUpdate(new Date());
      })
      .subscribe();

    // Cleanup subscriptions on component unmount
    return () => {
      supabase.removeChannel(maintenanceSubscription);
      supabase.removeChannel(levySubscription);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // Advanced aggregation queries using Supabase
      const [maintenanceData, levyData, unitsData, recentMaintenance, recentPayments] = await Promise.all([
        // Complex maintenance statistics with grouping
        supabase
          .from('maintenance_requests')
          .select('status, priority, created_at'),
        
        // Advanced levy calculations with joins
        supabase
          .from('levy_payments')
          .select(`
            amount,
            status,
            due_date,
            paid_date,
            late_fee,
            units (unit_number)
          `),
        
        // Units occupancy analysis
        supabase
          .from('units')
          .select(`
            id,
            unit_number,
            owners (id)
          `),
        
        // Recent maintenance with detailed joins
        supabase
          .from('maintenance_requests')
          .select(`
            request_id,
            description,
            status,
            priority,
            created_at,
            units (unit_number),
            owners (first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        
        // Recent payments with owner details
        supabase
          .from('levy_payments')
          .select(`
            amount,
            status,
            paid_date,
            quarter,
            year,
            units (unit_number),
            owners (first_name, last_name)
          `)
          .eq('status', 'paid')
          .order('paid_date', { ascending: false })
          .limit(5)
      ]);

      // Process maintenance statistics
      const maintenanceStats = {
        total: maintenanceData.data?.length || 0,
        pending: maintenanceData.data?.filter(r => r.status === 'pending').length || 0,
        inProgress: maintenanceData.data?.filter(r => r.status === 'in-progress').length || 0,
        completed: maintenanceData.data?.filter(r => r.status === 'completed').length || 0,
        emergency: maintenanceData.data?.filter(r => r.priority === 'emergency').length || 0
      };

      // Process levy statistics with advanced calculations
      const totalDue = levyData.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const totalPaid = levyData.data?.filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const overdue = levyData.data?.filter(p => {
        return p.status !== 'paid' && new Date(p.due_date) < new Date();
      }).length || 0;

      const levyStats = {
        totalDue,
        totalPaid,
        overdue,
        collectionRate: totalDue > 0 ? ((totalPaid / totalDue) * 100) : 0
      };

      // Process units occupancy
      const unitsStats = {
        total: unitsData.data?.length || 0,
        occupied: unitsData.data?.filter(u => u.owners && u.owners.length > 0).length || 0,
        vacant: unitsData.data?.filter(u => !u.owners || u.owners.length === 0).length || 0
      };

      setStats({
        maintenance: maintenanceStats,
        levy: levyStats,
        units: unitsStats,
        recent: {
          maintenance: recentMaintenance.data || [],
          payments: recentPayments.data || []
        }
      });

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

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffc107',
      'in-progress': '#17a2b8',
      'completed': '#28a745',
      'emergency': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) {
    return (
      <Layout title="Real-time Dashboard">
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Loading Real-time Dashboard...</h2>
          <p>Connecting to Supabase real-time subscriptions...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Real-time Dashboard">
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: '#003366', margin: 0 }}>Real-time Strata Dashboard</h1>
          <div style={{ 
            background: '#d4edda', 
            color: '#155724', 
            padding: '0.5rem 1rem', 
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}>
            🔴 Live • Last update: {lastUpdate.toLocaleTimeString()}
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
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>Maintenance Requests</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#003366', marginBottom: '0.5rem' }}>
              {stats.maintenance.total}
            </div>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#ffc107' }}>Pending: {stats.maintenance.pending}</span>
              <span style={{ color: '#17a2b8' }}>In Progress: {stats.maintenance.inProgress}</span>
            </div>
            {stats.maintenance.emergency > 0 && (
              <div style={{ 
                background: '#f8d7da', 
                color: '#721c24', 
                padding: '0.5rem', 
                borderRadius: '6px', 
                marginTop: '0.5rem',
                fontSize: '0.9rem',
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
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>Levy Collection</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#28a745', marginBottom: '0.5rem' }}>
              {stats.levy.collectionRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              <div>Collected: {formatCurrency(stats.levy.totalPaid)}</div>
              <div>Outstanding: {formatCurrency(stats.levy.totalDue - stats.levy.totalPaid)}</div>
            </div>
            {stats.levy.overdue > 0 && (
              <div style={{ 
                background: '#fff3cd', 
                color: '#856404', 
                padding: '0.5rem', 
                borderRadius: '6px', 
                marginTop: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                ⚠️ {stats.levy.overdue} Overdue Payment{stats.levy.overdue !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Units Occupancy */}
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>Unit Occupancy</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#003366', marginBottom: '0.5rem' }}>
              {stats.units.total}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              <div>Occupied: {stats.units.occupied}</div>
              <div>Vacant: {stats.units.vacant}</div>
              <div>Rate: {stats.units.total > 0 ? ((stats.units.occupied / stats.units.total) * 100).toFixed(1) : 0}%</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
          gap: '1.5rem'
        }}>
          {/* Recent Maintenance */}
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>Recent Maintenance</h3>
            {stats.recent.maintenance.map((request, index) => (
              <div key={request.request_id} style={{ 
                padding: '0.75rem', 
                borderBottom: index < stats.recent.maintenance.length - 1 ? '1px solid #eee' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#003366' }}>
                    {request.request_id} - Unit {request.units?.unit_number}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                    {request.description?.substring(0, 50)}...
                  </div>
                </div>
                <span style={{
                  background: getStatusColor(request.status),
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>

          {/* Recent Payments */}
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>Recent Payments</h3>
            {stats.recent.payments.map((payment, index) => (
              <div key={index} style={{ 
                padding: '0.75rem', 
                borderBottom: index < stats.recent.payments.length - 1 ? '1px solid #eee' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#003366' }}>
                    Unit {payment.units?.unit_number}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '0.25rem' }}>
                    {payment.owners?.first_name} {payment.owners?.last_name} • Q{payment.quarter}/{payment.year}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: '#28a745' }}>
                    {formatCurrency(payment.amount)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>
                    {new Date(payment.paid_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <strong>🔴 Real-time Integration:</strong> This dashboard automatically updates when data changes in Supabase using WebSocket subscriptions
        </div>
      </div>
    </Layout>
  );
}