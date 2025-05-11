import { useState } from 'react';
import Layout from '../components/Layout';
import styles from '../styles/Documents.module.css';
import { useRouter } from 'next/router';

export default function Documents() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginData, setLoginData] = useState({ unitNumber: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  // Mock data for documents
  const documents = [
    { id: 1, name: 'Insurance Certificate 2025', category: 'Insurance', date: '2025-01-15', file: '/documents/insurance-certificate-2025.pdf' },
    { id: 2, name: 'Annual Financial Report 2024', category: 'Finance', date: '2024-12-10', file: '/documents/financial-report-2024.pdf' },
    { id: 3, name: 'AGM Minutes - March 2025', category: 'Meeting Minutes', date: '2025-03-22', file: '/documents/agm-minutes-mar-2025.pdf' },
    { id: 4, name: 'Quarterly Strata Committee Meeting Minutes - January 2025', category: 'Meeting Minutes', date: '2025-01-20', file: '/documents/scm-minutes-jan-2025.pdf' },
    { id: 5, name: 'Building Inspection Report', category: 'Maintenance', date: '2024-11-05', file: '/documents/building-inspection-2024.pdf' },
    { id: 6, name: 'Fire Safety Compliance Certificate', category: 'Compliance', date: '2025-02-28', file: '/documents/fire-safety-2025.pdf' },
    { id: 7, name: 'Pool & Gym Maintenance Schedule', category: 'Maintenance', date: '2025-01-10', file: '/documents/pool-gym-schedule-2025.pdf' },
    { id: 8, name: 'Strata By-Laws', category: 'Legal', date: '2023-06-15', file: '/documents/strata-by-laws.pdf' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Simple mock authentication
    // In a real app, this would validate against a database
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
  };

  // Group documents by category
  const documentsByCategory = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {});

  return (
    <Layout title="Documents">
      <div className={styles.container}>
        <h1 className={styles.heading}>Strata Documents</h1>
        
        {!isLoggedIn ? (
          <div className={styles.loginContainer}>
            <div className={styles.card}>
              <h2>Secure Access</h2>
              <p>Please log in to access strata documents. Use your unit number and password.</p>
              
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
                  Login to Access Documents
                </button>
              </form>
              
              <div className={styles.helpText}>
                <p>Forgot your password? Contact the building manager or <a href="/contact">click here</a>.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.documentsContainer}>
            <div className={styles.documentsHeader}>
              <p>You are logged in as Unit {loginData.unitNumber}</p>
              <button onClick={handleLogout} className={styles.logoutButton}>
                Logout
              </button>
            </div>
            
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search documents..."
                className={styles.searchInput}
              />
            </div>
            
            {Object.entries(documentsByCategory).map(([category, docs]) => (
              <div key={category} className={styles.categorySection}>
                <h2 className={styles.categoryHeading}>{category}</h2>
                <div className={styles.documentList}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {docs.map(doc => (
                        <tr key={doc.id}>
                          <td>{doc.name}</td>
                          <td>{doc.date}</td>
                          <td>
                            <a 
                              href={doc.file} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className={styles.downloadLink}
                            >
                              Download
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}