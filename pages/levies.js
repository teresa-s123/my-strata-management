import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { supabase } from '../lib/supabase';

export default function Levies() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPayments() {
      try {
        console.log('Loading levy payments from database...');
        
        const { data, error } = await supabase
          .from('levy_payments')
          .select(`
            *,
            units (
              unit_number,
              unit_type
            ),
            owners (
              first_name,
              last_name,
              email
            )
          `)
          .order('due_date', { ascending: false });

        console.log('Database result:', { data, error });

        if (error) {
          throw error;
        }

        setPayments(data || []);
      } catch (err) {
        console.error('Error loading payments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-AU');
  };

  const getStatusBadge = (status) => {
    const styles = {
      'paid': { background: '#d4edda', color: '#155724' },
      'pending': { background: '#fff3cd', color: '#856404' },
      'overdue': { background: '#f8d7da', color: '#721c24' }
    };
    
    const style = styles[status] || styles.pending;
    
    return (
      <span style={{
        ...style,
        padding: '0.25rem 0.5rem',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: 'bold'
      }}>
        {status.toUpperCase()}
      </span>
    );
  };

  // Calculate statistics
  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'paid').length,
    pending: payments.filter(p => p.status === 'pending').length,
    overdue: payments.filter(p => p.status === 'overdue').length,
    totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    paidAmount: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  if (loading) {
    return (
      <Layout title="Levy Payments">
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Loading Levy Payment Data...</h2>
          <p>Fetching payment records from Supabase database...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Levy Payments">
        <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>❌ Error Loading Payment Data</h2>
          <p>{error}</p>
          <button className="btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Levy Payments">
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <h1 style={{ color: '#003366', textAlign: 'center', marginBottom: '2rem' }}>
          💰 Levy Notices & Payment Tracking
        </h1>
        
        <div className="alert alert-info" style={{ 
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <strong>🗄️ Database Integration:</strong> Real-time payment data from Supabase database ({payments.length} records loaded)
        </div>

        {/* Statistics Dashboard */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            textAlign: 'center', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Collection Rate</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#003366' }}>
              {stats.totalAmount > 0 ? ((stats.paidAmount / stats.totalAmount) * 100).toFixed(1) : 0}%
            </div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            textAlign: 'center', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Total Collected</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
              {formatCurrency(stats.paidAmount)}
            </div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            textAlign: 'center', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Outstanding</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
              {formatCurrency(stats.totalAmount - stats.paidAmount)}
            </div>
          </div>
          <div style={{ 
            background: 'white', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            textAlign: 'center', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Overdue</h3>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
              {stats.overdue}
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div style={{ 
          background: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
          overflow: 'hidden',
          border: '1px solid #e0e0e0'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr style={{ background: '#003366', color: 'white' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Unit</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Owner</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Quarter</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Due Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Paid Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={payment.id} style={{ 
                    borderBottom: '1px solid #eee',
                    background: index % 2 === 0 ? '#f8f9fa' : 'white'
                  }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#003366' }}>
                      {payment.units && payment.units.unit_number ? payment.units.unit_number : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {payment.owners ? (
                        <div>
                          <div style={{ fontWeight: '600' }}>
                            {payment.owners.first_name} {payment.owners.last_name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#666' }}>
                            {payment.owners.email}
                          </div>
                        </div>
                      ) : (
                        'No owner data'
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: 'bold' }}>
                        Q{payment.quarter}-{payment.year}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                      {formatCurrency(payment.amount)}
                      {payment.late_fee && payment.late_fee > 0 && (
                        <div style={{ fontSize: '0.8rem', color: '#dc3545' }}>
                          + {formatCurrency(payment.late_fee)} late fee
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {formatDate(payment.due_date)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {formatDate(payment.paid_date)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {getStatusBadge(payment.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {payments.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <h3>No payment records found</h3>
            <p>The database might be empty or there's a connection issue.</p>
          </div>
        )}

        <div className="alert alert-info" style={{ 
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          <strong>Live Database Integration:</strong> Payment data from Supabase • Last updated: {new Date().toLocaleString()}
        </div>
      </div>
    </Layout>
  );
}