import { useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Levies.module.css';

export default function Levies() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ unitNumber: '', password: '' });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('current');
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedLevyId, setSelectedLevyId] = useState(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    amount: 0
  });

  // Mock data for levy notices
  const levyNotices = [
    {
      id: 1,
      period: 'Q2 2025 (Apr-Jun)',
      dueDate: '2025-04-15',
      adminFund: 850.00,
      capitalFund: 425.00,
      total: 1275.00,
      status: 'unpaid',
      invoice: '/documents/levies/levy-notice-q2-2025.pdf'
    },
    {
      id: 2,
      period: 'Q1 2025 (Jan-Mar)',
      dueDate: '2025-01-15',
      adminFund: 850.00,
      capitalFund: 425.00,
      total: 1275.00,
      status: 'paid',
      paymentDate: '2025-01-10',
      invoice: '/documents/levies/levy-notice-q1-2025.pdf',
      receipt: '/documents/levies/receipt-q1-2025.pdf'
    },
    {
      id: 3,
      period: 'Q4 2024 (Oct-Dec)',
      dueDate: '2024-10-15',
      adminFund: 800.00,
      capitalFund: 400.00,
      total: 1200.00,
      status: 'paid',
      paymentDate: '2024-10-12',
      invoice: '/documents/levies/levy-notice-q4-2024.pdf',
      receipt: '/documents/levies/receipt-q4-2024.pdf'
    },
    {
      id: 4,
      period: 'Q3 2024 (Jul-Sep)',
      dueDate: '2024-07-15',
      adminFund: 800.00,
      capitalFund: 400.00,
      total: 1200.00,
      status: 'paid',
      paymentDate: '2024-07-13',
      invoice: '/documents/levies/levy-notice-q3-2024.pdf',
      receipt: '/documents/levies/receipt-q3-2024.pdf'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple mock authentication
    if (loginData.unitNumber && loginData.password === 'password123') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid unit number or password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ unitNumber: '', password: '' });
    setPaymentSuccess(false);
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would process the payment via a payment gateway
    // For now, simulate a successful payment
    setPaymentSuccess(true);
  };

  const handlePayNow = (levyId) => {
    const levy = levyNotices.find(l => l.id === levyId);
    setSelectedLevyId(levyId);
    setPaymentData(prev => ({ ...prev, amount: levy.total }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };

  return (
    <Layout title="Levy Notices">
      <div className={styles.container}>
        <h1 className={styles.heading}>Strata Levy Notices</h1>
        
        {!isLoggedIn ? (
          <div className={styles.loginContainer}>
            <div className={styles.card}>
              <h2>Owner Access</h2>
              <p>Please log in with your unit credentials to access your levy notices.</p>
              
              {error && <div className={styles.error}>{error}</div>}
              
              <form onSubmit={handleLogin} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="unitNumber">Unit Number</label>
                  <input
                    type="text"
                    id="unitNumber"
                    name="unitNumber"
                    value={loginData.unitNumber}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="e.g. 101"
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginData.password}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Enter your password"
                  />
                </div>
                
                <button type="submit" className={styles.button}>
                  Login to Access Levy Notices
                </button>
              </form>
              
              <div className={styles.helpText}>
                <p>Trouble logging in? Contact the building manager for assistance.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.leviesContainer}>
            {paymentSuccess ? (
              <div className={styles.successContainer}>
                <div className={styles.successMessage}>
                  <h2>Payment Successful!</h2>
                  <div className={styles.checkmark}>✓</div>
                  <p>Your levy payment has been processed successfully.</p>
                  <p>A receipt has been emailed to your registered email address.</p>
                  
                  <div className={styles.paymentDetails}>
                    <h3>Payment Details</h3>
                    <div className={styles.detailItem}>
                      <span>Period:</span>
                      <span>{levyNotices.find(l => l.id === selectedLevyId)?.period}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Amount Paid:</span>
                      <span>{formatCurrency(paymentData.amount)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Payment Date:</span>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Payment Method:</span>
                      <span>Credit Card (ending in {paymentData.cardNumber.slice(-4)})</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>Transaction ID:</span>
                      <span>TXN{Math.floor(100000 + Math.random() * 900000)}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setPaymentSuccess(false);
                      setSelectedLevyId(null);
                    }} 
                    className={styles.backButton}
                  >
                    Return to Levy Notices
                  </button>
                </div>
              </div>
            ) : selectedLevyId ? (
              <div className={styles.paymentContainer}>
                <div className={styles.paymentHeader}>
                  <h2>Pay Levy Notice</h2>
                  <button 
                    onClick={() => setSelectedLevyId(null)} 
                    className={styles.backLink}
                  >
                    &larr; Back to Levy Notices
                  </button>
                </div>
                
                <div className={styles.levyDetails}>
                  <h3>Levy Details</h3>
                  <div className={styles.detailRow}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Period:</span>
                      <span>{levyNotices.find(l => l.id === selectedLevyId)?.period}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Due Date:</span>
                      <span>{levyNotices.find(l => l.id === selectedLevyId)?.dueDate}</span>
                    </div>
                  </div>
                  <div className={styles.detailRow}>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Administration Fund:</span>
                      <span>{formatCurrency(levyNotices.find(l => l.id === selectedLevyId)?.adminFund)}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Capital Works Fund:</span>
                      <span>{formatCurrency(levyNotices.find(l => l.id === selectedLevyId)?.capitalFund)}</span>
                    </div>
                  </div>
                  <div className={styles.totalAmount}>
                    <span>Total Amount Due:</span>
                    <span>{formatCurrency(levyNotices.find(l => l.id === selectedLevyId)?.total)}</span>
                  </div>
                </div>
                
                <div className={styles.paymentMethodTabs}>
                  <button 
                    className={`${styles.methodTab} ${paymentMethod === 'creditCard' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('creditCard')}
                  >
                    Credit Card
                  </button>
                  <button 
                    className={`${styles.methodTab} ${paymentMethod === 'directDebit' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('directDebit')}
                  >
                    Direct Debit
                  </button>
                  <button 
                    className={`${styles.methodTab} ${paymentMethod === 'paypal' ? styles.active : ''}`}
                    onClick={() => setPaymentMethod('paypal')}
                  >
                    PayPal
                  </button>
                </div>
                
                <div className={styles.paymentForm}>
                  {paymentMethod === 'creditCard' && (
                    <form onSubmit={handlePaymentSubmit}>
                      <div className={styles.formGroup}>
                        <label htmlFor="cardNumber">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={paymentData.cardNumber}
                          onChange={handlePaymentChange}
                          required
                          className={styles.input}
                          placeholder="1234 5678 9012 3456"
                          maxLength="19"
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label htmlFor="cardName">Cardholder Name</label>
                        <input
                          type="text"
                          id="cardName"
                          name="cardName"
                          value={paymentData.cardName}
                          onChange={handlePaymentChange}
                          required
                          className={styles.input}
                          placeholder="Name as it appears on card"
                        />
                      </div>
                      
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label htmlFor="expiryDate">Expiry Date</label>
                          <input
                            type="text"
                            id="expiryDate"
                            name="expiryDate"
                            value={paymentData.expiryDate}
                            onChange={handlePaymentChange}
                            required
                            className={styles.input}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                        </div>
                        
                        <div className={styles.formGroup}>
                          <label htmlFor="cvv">CVV</label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={paymentData.cvv}
                            onChange={handlePaymentChange}
                            required
                            className={styles.input}
                            placeholder="123"
                            maxLength="4"
                          />
                        </div>
                      </div>
                      
                      <div className={styles.securePayment}>
                        <span>🔒 Secure Payment</span>
                        <p>Your payment information is encrypted and secure.</p>
                      </div>
                      
                      <button type="submit" className={styles.payButton}>
                        Pay {formatCurrency(levyNotices.find(l => l.id === selectedLevyId)?.total)}
                      </button>
                    </form>
                  )}
                  
                  {paymentMethod === 'directDebit' && (
                    <div className={styles.alternativePayment}>
                      <h3>Direct Debit Payment</h3>
                      <p>Please use the following bank details to make a direct debit payment:</p>
                      <div className={styles.bankDetails}>
                        <div className={styles.bankDetail}>
                          <span>Bank:</span>
                          <span>Commonwealth Bank of Australia</span>
                        </div>
                        <div className={styles.bankDetail}>
                          <span>Account Name:</span>
                          <span>Oceanview Apartments Administration Fund</span>
                        </div>
                        <div className={styles.bankDetail}>
                          <span>BSB:</span>
                          <span>062-000</span>
                        </div>
                        <div className={styles.bankDetail}>
                          <span>Account Number:</span>
                          <span>1234 5678</span>
                        </div>
                        <div className={styles.bankDetail}>
                          <span>Reference:</span>
                          <span>Unit {loginData.unitNumber} Q2 2025</span>
                        </div>
                      </div>
                      <p>Please allow up to 3 business days for your payment to be processed.</p>
                    </div>
                  )}
                  
                  {paymentMethod === 'paypal' && (
                    <div className={styles.alternativePayment}>
                      <h3>PayPal Payment</h3>
                      <p>Click the button below to pay via PayPal:</p>
                      <button className={styles.paypalButton}>
                        Pay with PayPal
                      </button>
                      <p>You will be redirected to PayPal to complete your payment.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className={styles.leviesHeader}>
                  <div>
                    <p>Unit {loginData.unitNumber}</p>
                    <h2>Your Levy Notices</h2>
                  </div>
                  <button onClick={handleLogout} className={styles.logoutButton}>
                    Logout
                  </button>
                </div>
                
                <div className={styles.tabContainer}>
                  <div className={styles.tabs}>
                    <button 
                      className={`${styles.tabButton} ${activeTab === 'current' ? styles.active : ''}`}
                      onClick={() => setActiveTab('current')}
                    >
                      Current Levies
                    </button>
                    <button 
                      className={`${styles.tabButton} ${activeTab === 'history' ? styles.active : ''}`}
                      onClick={() => setActiveTab('history')}
                    >
                      Payment History
                    </button>
                  </div>
                  
                  <div className={styles.tabContent}>
                    {activeTab === 'current' && (
                      <div className={styles.currentLevies}>
                        <div className={styles.infoBox}>
                          <h3>About Strata Levies</h3>
                          <p>Strata levies are contributions paid by owners to cover the costs of maintaining and managing the building. These are typically paid quarterly and are split between the Administrative Fund and the Capital Works Fund.</p>
                        </div>
                        
                        <h3>Upcoming & Current Levies</h3>
                        
                        {levyNotices.filter(levy => levy.status === 'unpaid').length > 0 ? (
                          <div className={styles.levyCards}>
                            {levyNotices
                              .filter(levy => levy.status === 'unpaid')
                              .map(levy => (
                                <div className={styles.levyCard} key={levy.id}>
                                  <div className={styles.levyPeriod}>{levy.period}</div>
                                  <div className={styles.levyAmount}>{formatCurrency(levy.total)}</div>
                                  <div className={styles.levyDetail}>
                                    <span>Due Date:</span>
                                    <span>{levy.dueDate}</span>
                                  </div>
                                  <div className={styles.levyDetail}>
                                    <span>Admin Fund:</span>
                                    <span>{formatCurrency(levy.adminFund)}</span>
                                  </div>
                                  <div className={styles.levyDetail}>
                                    <span>Capital Works Fund:</span>
                                    <span>{formatCurrency(levy.capitalFund)}</span>
                                  </div>
                                  <div className={styles.levyActions}>
                                    <a 
                                      href={levy.invoice} 
                                      className={styles.invoiceButton}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      View Invoice
                                    </a>
                                    <button 
                                      className={styles.payNowButton}
                                      onClick={() => handlePayNow(levy.id)}
                                    >
                                      Pay Now
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className={styles.noLevies}>
                            <p>You have no outstanding levy payments at this time.</p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {activeTab === 'history' && (
                      <div className={styles.paymentHistory}>
                        <h3>Levy Payment History</h3>
                        
                        <div className={styles.historyTable}>
                          <table className={styles.table}>
                            <thead>
                              <tr>
                                <th>Period</th>
                                <th>Amount</th>
                                <th>Payment Date</th>
                                <th>Status</th>
                                <th>Documents</th>
                              </tr>
                            </thead>
                            <tbody>
                              {levyNotices.map(levy => (
                                <tr key={levy.id}>
                                  <td>{levy.period}</td>
                                  <td>{formatCurrency(levy.total)}</td>
                                  <td>{levy.status === 'paid' ? levy.paymentDate : '-'}</td>
                                  <td>
                                    <span className={`${styles.status} ${styles[levy.status]}`}>
                                      {levy.status.charAt(0).toUpperCase() + levy.status.slice(1)}
                                    </span>
                                  </td>
                                  <td>
                                    <div className={styles.documentLinks}>
                                      <a 
                                        href={levy.invoice} 
                                        className={styles.documentLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        Invoice
                                      </a>
                                      {levy.status === 'paid' && (
                                        <a 
                                          href={levy.receipt} 
                                          className={styles.documentLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          Receipt
                                        </a>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className={styles.exportOptions}>
                          <button className={styles.exportButton}>
                            Export to PDF
                          </button>
                          <button className={styles.exportButton}>
                            Export to Excel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}