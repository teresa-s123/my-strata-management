import { useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Budgets.module.css';

export default function Budgets() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  // Mock data for financial summary
  const financialSummary = {
    adminFund: {
      balance: 52480.75,
      income: 87500.00,
      expenses: 65250.45,
      budgeted: 90000.00
    },
    capitalWorksFund: {
      balance: 236750.20,
      income: 48000.00,
      expenses: 35680.30,
      budgeted: 50000.00
    }
  };

  // Mock data for expenses by category
  const expenseCategories = [
    { name: 'Building Insurance', amount: 28500.00, percentage: 28.2 },
    { name: 'Cleaning & Waste Management', amount: 18200.75, percentage: 18.0 },
    { name: 'Building Management', amount: 14800.00, percentage: 14.6 },
    { name: 'Utilities (Common Areas)', amount: 12450.50, percentage: 12.3 },
    { name: 'Repairs & Maintenance', amount: 10500.20, percentage: 10.4 },
    { name: 'Gardening & Landscaping', amount: 8450.00, percentage: 8.4 },
    { name: 'Security', amount: 5250.00, percentage: 5.2 },
    { name: 'Admin & Professional Fees', amount: 3000.00, percentage: 3.0 }
  ];

  // Mock data for quarterly levy reports
  const quarterlyReports = [
    { period: 'Q1 2025 (Jan-Mar)', report: '/documents/financial/q1-2025-report.pdf', date: '2025-04-15' },
    { period: 'Q4 2024 (Oct-Dec)', report: '/documents/financial/q4-2024-report.pdf', date: '2025-01-15' },
    { period: 'Q3 2024 (Jul-Sep)', report: '/documents/financial/q3-2024-report.pdf', date: '2024-10-15' },
    { period: 'Q2 2024 (Apr-Jun)', report: '/documents/financial/q2-2024-report.pdf', date: '2024-07-15' }
  ];

  // Mock data for capital works projects
  const capitalProjects = [
    { 
      name: 'Swimming Pool Renovation',
      budget: 85000.00,
      spent: 82500.50,
      status: 'Completed',
      completion: 100,
      details: 'Complete renovation of the swimming pool area including new tiles, filtration system, and poolside furniture.'
    },
    { 
      name: 'Lobby Refurbishment',
      budget: 45000.00,
      spent: 47200.25,
      status: 'Completed',
      completion: 100,
      details: 'Refurbishment of the main lobby including new flooring, lighting, and reception desk.'
    },
    { 
      name: 'External Facade Painting',
      budget: 120000.00,
      spent: 60500.00,
      status: 'In Progress',
      completion: 50,
      details: 'Repainting of the entire building exterior. Currently completed the north and east facing sides.'
    },
    { 
      name: 'Gym Equipment Upgrade',
      budget: 35000.00,
      spent: 0,
      status: 'Planned',
      completion: 0,
      details: 'Replacement of cardio equipment and addition of new strength training machines. Scheduled for August 2025.'
    },
    { 
      name: 'Security System Upgrade',
      budget: 48000.00,
      spent: 12500.00,
      status: 'In Progress',
      completion: 25,
      details: 'Installation of new CCTV cameras, access control system, and intercom upgrades.'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple mock authentication
    if (loginData.username === 'committee' && loginData.password === 'password123') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginData({ username: '', password: '' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
  };

  return (
    <Layout title="Budgets & Finances">
      <div className={styles.container}>
        <h1 className={styles.heading}>Budgets & Financial Overview</h1>
        
        {!isLoggedIn ? (
          <div className={styles.loginContainer}>
            <div className={styles.card}>
              <h2>Committee Access Only</h2>
              <p>Please log in with your committee credentials to access financial information.</p>
              
              {error && <div className={styles.error}>{error}</div>}
              
              <form onSubmit={handleLogin} className={styles.form}>
                <div className={styles.formGroup}>
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={loginData.username}
                    onChange={handleChange}
                    required
                    className={styles.input}
                    placeholder="Enter your username"
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
                  Login to Access Finances
                </button>
              </form>
              
              <div className={styles.helpText}>
                <p>Note: Financial information is only accessible to authorized committee members.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.budgetContainer}>
            <div className={styles.budgetHeader}>
              <p>Logged in as Committee Member: {loginData.username}</p>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
            
            <div className={styles.tabContainer}>
              <div className={styles.tabs}>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'summary' ? styles.active : ''}`}
                  onClick={() => setActiveTab('summary')}
                >
                  Financial Summary
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'expenses' ? styles.active : ''}`}
                  onClick={() => setActiveTab('expenses')}
                >
                  Expense Breakdown
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'capital' ? styles.active : ''}`}
                  onClick={() => setActiveTab('capital')}
                >
                  Capital Works
                </button>
                <button 
                  className={`${styles.tabButton} ${activeTab === 'reports' ? styles.active : ''}`}
                  onClick={() => setActiveTab('reports')}
                >
                  Quarterly Reports
                </button>
              </div>
              
              <div className={styles.tabContent}>
                {activeTab === 'summary' && (
                  <div className={styles.summaryTab}>
                    <h2>Financial Summary (Current Financial Year)</h2>
                    <p className={styles.updated}>Last updated: May 1, 2025</p>
                    
                    <div className={styles.fundCards}>
                      <div className={styles.fundCard}>
                        <h3>Administration Fund</h3>
                        <div className={styles.fundBalance}>
                          <span className={styles.balanceLabel}>Current Balance:</span>
                          <span className={styles.balanceAmount}>{formatCurrency(financialSummary.adminFund.balance)}</span>
                        </div>
                        <div className={styles.fundDetails}>
                          <div className={styles.fundDetail}>
                            <span>Total Income:</span>
                            <span>{formatCurrency(financialSummary.adminFund.income)}</span>
                          </div>
                          <div className={styles.fundDetail}>
                            <span>Total Expenses:</span>
                            <span>{formatCurrency(financialSummary.adminFund.expenses)}</span>
                          </div>
                          <div className={styles.fundDetail}>
                            <span>Annual Budget:</span>
                            <span>{formatCurrency(financialSummary.adminFund.budgeted)}</span>
                          </div>
                          <div className={styles.fundDetail}>
                            <span>Budget Utilization:</span>
                            <span>{Math.round((financialSummary.adminFund.expenses / financialSummary.adminFund.budgeted) * 100)}%</span>
                          </div>
                        </div>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progress}
                            style={{ width: `${(financialSummary.adminFund.expenses / financialSummary.adminFund.budgeted) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className={styles.fundCard}>
                        <h3>Capital Works Fund</h3>
                        <div className={styles.fundBalance}>
                          <span className={styles.balanceLabel}>Current Balance:</span>
                          <span className={styles.balanceAmount}>{formatCurrency(financialSummary.capitalWorksFund.balance)}</span>
                        </div>
                        <div className={styles.fundDetails}>
                          <div className={styles.fundDetail}>
                            <span>Total Income:</span>
                            <span>{formatCurrency(financialSummary.capitalWorksFund.income)}</span>
                          </div>
                          <div className={styles.fundDetail}>
                            <span>Total Expenses:</span>
                            <span>{formatCurrency(financialSummary.capitalWorksFund.expenses)}</span>
                          </div>
                          <div className={styles.fundDetail}>
                            <span>Annual Budget:</span>
                            <span>{formatCurrency(financialSummary.capitalWorksFund.budgeted)}</span>
                          </div>
                          <div className={styles.fundDetail}>
                            <span>Budget Utilization:</span>
                            <span>{Math.round((financialSummary.capitalWorksFund.expenses / financialSummary.capitalWorksFund.budgeted) * 100)}%</span>
                          </div>
                        </div>
                        <div className={styles.progressBar}>
                          <div 
                            className={styles.progress}
                            style={{ width: `${(financialSummary.capitalWorksFund.expenses / financialSummary.capitalWorksFund.budgeted) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={styles.totalFunds}>
                      <h3>Total Funds Available</h3>
                      <div className={styles.totalAmount}>
                        {formatCurrency(financialSummary.adminFund.balance + financialSummary.capitalWorksFund.balance)}
                      </div>
                    </div>
                    
                    <div className={styles.summaryActions}>
                      <a href="/documents/financial/budget-2025.pdf" className={styles.actionBtn} target="_blank" rel="noopener noreferrer">
                        View Full Budget
                      </a>
                      <a href="/documents/financial/financial-statement-2024.pdf" className={styles.actionBtn} target="_blank" rel="noopener noreferrer">
                        Last Year's Financial Statement
                      </a>
                    </div>
                  </div>
                )}
                
                {activeTab === 'expenses' && (
                  <div className={styles.expensesTab}>
                    <h2>Expense Breakdown</h2>
                    <p className={styles.updated}>Current Financial Year (2024-2025)</p>
                    
                    <div className={styles.expenseTable}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>% of Total</th>
                            <th>Visualization</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenseCategories.map((category, index) => (
                            <tr key={index}>
                              <td>{category.name}</td>
                              <td>{formatCurrency(category.amount)}</td>
                              <td>{category.percentage}%</td>
                              <td>
                                <div className={styles.barContainer}>
                                  <div 
                                    className={styles.bar}
                                    style={{ width: `${category.percentage}%` }}
                                  ></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td><strong>Total Expenses</strong></td>
                            <td>
                              <strong>
                                {formatCurrency(expenseCategories.reduce((sum, cat) => sum + cat.amount, 0))}
                              </strong>
                            </td>
                            <td>100%</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    
                    <div className={styles.expensesNotes}>
                      <h3>Notes:</h3>
                      <ul>
                        <li>Building insurance premiums increased by 5% compared to the previous year due to industry-wide adjustments.</li>
                        <li>Utilities costs have decreased by 8% following the installation of energy-efficient lighting in common areas.</li>
                        <li>A special allocation was made for repairs to the rooftop garden drainage system in February 2025.</li>
                      </ul>
                    </div>
                  </div>
                )}
                
                {activeTab === 'capital' && (
                  <div className={styles.capitalTab}>
                    <h2>Capital Works Projects</h2>
                    <p className={styles.updated}>5-Year Capital Works Plan (2023-2028)</p>
                    
                    <div className={styles.projectCards}>
                      {capitalProjects.map((project, index) => (
                        <div className={styles.projectCard} key={index}>
                          <h3>{project.name}</h3>
                          <div className={styles.projectStatus}>
                            <span 
                              className={`${styles.statusBadge} ${
                                project.status === 'Completed' ? styles.completed : 
                                project.status === 'In Progress' ? styles.inProgress : 
                                styles.planned
                              }`}
                            >
                              {project.status}
                            </span>
                          </div>
                          <div className={styles.projectDetails}>
                            <div className={styles.projectDetail}>
                              <span>Budget:</span>
                              <span>{formatCurrency(project.budget)}</span>
                            </div>
                            <div className={styles.projectDetail}>
                              <span>Spent:</span>
                              <span>{formatCurrency(project.spent)}</span>
                            </div>
                            <div className={styles.projectDetail}>
                              <span>Remaining:</span>
                              <span>{formatCurrency(project.budget - project.spent)}</span>
                            </div>
                          </div>
                          <div className={styles.progressLabel}>
                            <span>Completion: {project.completion}%</span>
                          </div>
                          <div className={styles.progressBar}>
                            <div 
                              className={styles.progress}
                              style={{ 
                                width: `${project.completion}%`,
                                backgroundColor: 
                                  project.status === 'Completed' ? '#28a745' : 
                                  project.status === 'In Progress' ? '#0070f3' : 
                                  '#6c757d'
                              }}
                            ></div>
                          </div>
                          <p className={styles.projectDescription}>{project.details}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className={styles.capitalSummary}>
                      <h3>Capital Works Fund Summary</h3>
                      <div className={styles.summaryDetails}>
                        <div className={styles.summaryDetail}>
                          <span>Total Budget (All Projects):</span>
                          <span>{formatCurrency(capitalProjects.reduce((sum, proj) => sum + proj.budget, 0))}</span>
                        </div>
                        <div className={styles.summaryDetail}>
                          <span>Total Spent:</span>
                          <span>{formatCurrency(capitalProjects.reduce((sum, proj) => sum + proj.spent, 0))}</span>
                        </div>
                        <div className={styles.summaryDetail}>
                          <span>Current Fund Balance:</span>
                          <span>{formatCurrency(financialSummary.capitalWorksFund.balance)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'reports' && (
                  <div className={styles.reportsTab}>
                    <h2>Quarterly Financial Reports</h2>
                    <p className={styles.updated}>Available reports for download</p>
                    
                    <div className={styles.reportList}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Period</th>
                            <th>Release Date</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {quarterlyReports.map((report, index) => (
                            <tr key={index}>
                              <td>{report.period}</td>
                              <td>{report.date}</td>
                              <td>
                                <a 
                                  href={report.report} 
                                  className={styles.downloadBtn}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Download PDF
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className={styles.annualReports}>
                      <h3>Annual Reports</h3>
                      <div className={styles.reportLinks}>
                        <a 
                          href="/documents/financial/annual-report-2024.pdf" 
                          className={styles.reportLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Annual Financial Report 2024
                        </a>
                        <a 
                          href="/documents/financial/annual-report-2023.pdf" 
                          className={styles.reportLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Annual Financial Report 2023
                        </a>
                        <a 
                          href="/documents/financial/annual-report-2022.pdf" 
                          className={styles.reportLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Annual Financial Report 2022
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}