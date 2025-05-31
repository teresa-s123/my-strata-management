import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Levies.module.css';
import { getLevyPayments, supabase } from '../lib/supabase';

export default function Levies() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('2025');
  const [units, setUnits] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load all payments
        const { data: paymentsData, error: paymentsError } = await getLevyPayments();
        if (paymentsError) throw paymentsError;
        setPayments(paymentsData || []);

        // Load units for filter dropdown
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select('id, unit_number, unit_type')
          .order('unit_number');
        if (unitsError) throw unitsError;
        setUnits(unitsData || []);

      } catch (err) {
        console.error('Error loading levy data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter payments based on selected criteria
  const filteredPayments = payments.filter(payment => {
    const matchesUnit = selectedUnit === 'all' || 
      (payment.units && payment.units.unit_number === selectedUnit);
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    const matchesYear = yearFilter === 'all' || payment.year.toString() === yearFilter;
    
    return matchesUnit && matchesStatus && matchesYear;
  });

  // Calculate statistics
  const getStats = () => {
    const totalPayments = filteredPayments.length;
    const paidPayments = filteredPayments.filter(p => p.status === 'paid');
    const overduePayments = filteredPayments.filter(p => p.status === 'overdue');
    const pendingPayments = filteredPayments.filter(p => p.status === 'pending');
    
    const totalAmount = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const paidAmount = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const outstandingAmount = totalAmount - paidAmount;

    return {
      totalPayments,
      paidCount: paidPayments.length,
      overdueCount: overduePayments.length,
      pendingCount: pendingPayments.length,
      totalAmount,
      paidAmount,
      outstandingAmount,
      collectionRate: totalAmount > 0 ? (paidAmount / totalAmount * 100).toFixed(1) : 0
    };
  };

  const stats = getStats();

  const getStatusBadge = (status) => {
    const badges = {
      'paid': { class: 'statusPaid', text: 'Paid', icon: '✅' },
      'pending': { class: 'statusPending', text: 'Pending', icon: '⏳' },
      'overdue': { class: 'statusOverdue', text: 'Overdue', icon: '⚠️' },
      'partial': { class: 'statusPartial', text: 'Partial', icon: '📊' }
    };
    
    const badge = badges[status] || { class: 'statusPending', text: status, icon: '❓' };
    
    return (
      <span className={`${styles.statusBadge} ${styles[badge.class]}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

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

  if (loading) {
    return (
      <Layout title="Levy Notices">
        <div className={styles.container}>
          <div className={styles.loading}>
            <h2>Loading Levy Payment Data...</h2>
            <p>Fetching payment records from database...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Levy Notices">
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>❌ Error Loading Levy Data</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className={styles.retryButton}>
              Retry
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Levy Notices">
      <div className={styles.container}>
        <h1 className={styles.heading}>Levy Notices & Payments</h1>
        
        <div className={styles.instructions}>
          <h2>Strata Levy Management</h2>
          <p>Track levy payments, view outstanding amounts, and monitor collection rates for all units in Oceanview Apartments.</p>
          <div className={styles.dbBadge}>
            🗄️ Real-time data from Supabase database
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Collection Rate</h3>
            <div className={styles.statNumber}>{stats.collectionRate}%</div>
            <div className={styles.statDetail}>of total levies collected</div>
          </div>
          <div className={styles.statCard}>
            <h3>Total Collected</h3>
            <div className={styles.statNumber}>{formatCurrency(stats.paidAmount)}</div>
            <div className={styles.statDetail}>{stats.paidCount} payments</div>
          </div>
          <div className={styles.statCard}>
            <h3>Outstanding</h3>
            <div className={styles.statNumber}>{formatCurrency(stats.outstandingAmount)}</div>
            <div className={styles.statDetail}>{stats.pendingCount + stats.overdueCount} unpaid</div>
          </div>
          <div className={styles.statCard}>
            <h3>Overdue</h3>
            <div className={styles.statNumber}>{stats.overdueCount}</div>
            <div className={styles.statDetail}>require attention</div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label>Unit:</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Units</option>
              {units.map(unit => (
                <option key={unit.id} value={unit.unit_number}>
                  Unit {unit.unit_number} ({unit.unit_type})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="partial">Partial</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label>Year:</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Years</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
        </div>

        <div className={styles.resultsInfo}>
          Showing {filteredPayments.length} of {payments.length} levy records
        </div>

        {/* Payments Table */}
        <div className={styles.tableContainer}>
          <table className={styles.paymentsTable}>
            <thead>
              <tr>
                <th>Unit</th>
                <th>Owner</th>
                <th>Quarter</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Paid Date</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Late Fee</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => {
                const isOverdue = payment.status === 'overdue';
                const daysOverdue = isOverdue && payment.due_date 
                  ? Math.floor((new Date() - new Date(payment.due_date)) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <tr key={payment.id} className={isOverdue ? styles.overdueRow : ''}>
                    <td className={styles.unitCell}>
                      {payment.units?.unit_number || 'N/A'}
                    </td>
                    <td className={styles.ownerCell}>
                      {payment.owners ? (
                        <div>
                          <div className={styles.ownerName}>
                            {payment.owners.first_name} {payment.owners.last_name}
                          </div>
                          <div className={styles.ownerEmail}>{payment.owners.email}</div>
                        </div>
                      ) : (
                        'No owner data'
                      )}
                    </td>
                    <td className={styles.quarterCell}>
                      <div className={styles.quarter}>{payment.quarter}-{payment.year}</div>
                    </td>
                    <td className={styles.amountCell}>
                      <div className={styles.amount}>{formatCurrency(payment.amount)}</div>
                      {payment.late_fee > 0 && (
                        <div className={styles.lateFee}>
                          + {formatCurrency(payment.late_fee)} late fee
                        </div>
                      )}
                    </td>
                    <td className={styles.dateCell}>
                      <div className={formatDate(payment.due_date)}>
                        {formatDate(payment.due_date)}
                      </div>
                      {isOverdue && (
                        <div className={styles.overdueDays}>
                          {daysOverdue} days overdue
                        </div>
                      )}
                    </td>
                    <td className={styles.dateCell}>
                      {formatDate(payment.paid_date)}
                    </td>
                    <td className={styles.methodCell}>
                      {payment.payment_method ? (
                        <span className={styles.paymentMethod}>
                          {payment.payment_method.replace('_', ' ').toUpperCase()}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className={styles.statusCell}>
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className={styles.feeCell}>
                      {payment.late_fee > 0 ? formatCurrency(payment.late_fee) : '-'}
                    </td>
                    <td className={styles.actionsCell}>
                      {payment.status === 'pending' && (
                        <button className={styles.payButton}>
                          Pay Now
                        </button>
                      )}
                      {payment.status === 'overdue' && (
                        <button className={styles.urgentButton}>
                          Pay Urgent
                        </button>
                      )}
                      {payment.status === 'paid' && (
                        <button className={styles.receiptButton}>
                          Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className={styles.noResults}>
            <h3>No levy records found</h3>
            <p>Try adjusting your filter criteria.</p>
          </div>
        )}

        <div className={styles.footer}>
          <div className={styles.footerInfo}>
            <p><strong>Database Integration:</strong> All levy payment data is stored and retrieved from Supabase in real-time</p>
            <p><strong>Last Updated:</strong> {new Date().toLocaleString('en-AU')}</p>
            <p><strong>Total Outstanding:</strong> {formatCurrency(stats.outstandingAmount)} across {stats.pendingCount + stats.overdueCount} unpaid levies</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}